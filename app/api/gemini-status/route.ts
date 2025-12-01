// Gemini API health status endpoint
// Returns cached status to avoid overwhelming the API

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Cache status for 5 minutes to avoid excessive API calls
let cachedStatus: { healthy: boolean; timestamp: number; model: string } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached status if still valid
    if (cachedStatus && (now - cachedStatus.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        healthy: cachedStatus.healthy,
        model: cachedStatus.model,
        cached: true,
        age: Math.floor((now - cachedStatus.timestamp) / 1000)
      });
    }

    // Check Gemini health
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      cachedStatus = { healthy: false, timestamp: now, model: 'unknown' };
      return NextResponse.json({ 
        healthy: false, 
        error: 'API key not configured',
        cached: false
      });
    }

    // Use the same model as configured in lib/ai.ts
    const modelName = 'gemini-2.0-flash-exp';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Quick test with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const testPromise = model.generateContent('ok');
      
      await Promise.race([testPromise, timeoutPromise]);
      
      // Success - cache and return
      cachedStatus = { healthy: true, timestamp: now, model: modelName };
      return NextResponse.json({ 
        healthy: true, 
        model: modelName,
        cached: false
      });
      
    } catch (error) {
      // Model test failed
      cachedStatus = { healthy: false, timestamp: now, model: modelName };
      return NextResponse.json({ 
        healthy: false, 
        model: modelName,
        error: error instanceof Error ? error.message : 'Unknown error',
        cached: false
      });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false
    }, { status: 500 });
  }
}
