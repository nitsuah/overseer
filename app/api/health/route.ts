import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_GEMINI_MODEL } from '@/lib/gemini-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    gemini?: {
      status: 'healthy' | 'down';
      model: string;
      error?: string;
    };
    openai?: {
      status: 'healthy' | 'down';
      model: string;
      error?: string;
    };
    anthropic?: {
      status: 'healthy' | 'down';
      model: string;
      error?: string;
    };
    database?: {
      status: 'healthy' | 'down';
      error?: string;
    };
  };
  availableModels?: string[];
}

async function testGemini(): Promise<{ status: 'healthy' | 'down'; model: string; error?: string; availableModels?: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return { status: 'down', model: DEFAULT_GEMINI_MODEL, error: 'GEMINI_API_KEY not configured' };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Test the configured model
    const model = genAI.getGenerativeModel({ model: DEFAULT_GEMINI_MODEL });
    await model.generateContent('health check');
    return { status: 'healthy', model: DEFAULT_GEMINI_MODEL };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If model not found, try to discover available models
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        
    if (response.ok) {
      const data = await response.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
      const availableModels = (data.models || [])
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace('models/', ''));          return {
            status: 'down',
            model: DEFAULT_GEMINI_MODEL,
            error: `Model "${DEFAULT_GEMINI_MODEL}" not found. Try one of these: ${availableModels.slice(0, 3).join(', ')}`,
            availableModels,
          };
        }
      } catch {
        // Ignore listing errors
      }
    }
    
    return { status: 'down', model: DEFAULT_GEMINI_MODEL, error: errorMessage };
  }
}

async function testOpenAI(): Promise<{ status: 'healthy' | 'down'; model: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return { status: 'down', model: 'gpt-4-turbo-preview', error: 'Not configured (optional)' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return { status: 'healthy', model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { status: 'down', model: 'gpt-4-turbo-preview', error: errorMessage };
  }
}

async function testAnthropic(): Promise<{ status: 'healthy' | 'down'; model: string; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return { status: 'down', model: 'claude-3-5-sonnet-20241022', error: 'Not configured (optional)' };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'health check' }],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return { status: 'healthy', model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { status: 'down', model: 'claude-3-5-sonnet-20241022', error: errorMessage };
  }
}

export async function GET() {
  try {
    // Test all AI providers in parallel
    const [gemini, openai, anthropic] = await Promise.all([
      testGemini(),
      testOpenAI(),
      testAnthropic(),
    ]);

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    
    if (gemini.status === 'down') {
      // Primary provider down
      if (openai.status === 'healthy' || anthropic.status === 'healthy') {
        overallStatus = 'degraded'; // Fallback available
      } else {
        overallStatus = 'down'; // No AI available
      }
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        gemini,
        openai,
        anthropic,
      },
    };

    // Include available models in response if Gemini is down
    if (gemini.availableModels) {
      healthStatus.availableModels = gemini.availableModels;
    }

    const statusCode = overallStatus === 'down' ? 503 : 200;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
