import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('Testing Gemini API connection...\n');
    console.log('API Key configured:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');
    
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in .env.local');
        process.exit(1);
    }
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try different model names (Gemini 2.x models as of 2025)
        const modelsToTry = [
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
        ];
        
        for (const modelName of modelsToTry) {
            console.log(`\nTrying model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    }
                });
                
                const result = await model.generateContent('Say "Hello from Gemini!" and nothing else.');
                const response = result.response;
                const text = response.text();
                
                console.log(`✅ Success with ${modelName}!`);
                console.log('Response:', text);
                console.log(`\n🎉 Use this model in lib/ai.ts: "${modelName}"`);
                return;
                
            } catch (err) {
                console.log(`❌ ${modelName} failed:`, err instanceof Error ? err.message.split('\n')[0] : 'Unknown error');
            }
        }
        
        console.error('\n❌ All models failed. Check your API key or try a different region.');
        process.exit(1);
        
    } catch (error) {
        console.error('\n❌ Error testing Gemini API:');
        if (error instanceof Error) {
            console.error('Name:', error.name);
            console.error('Message:', error.message);
            
            // Provide specific guidance
            if (error.message.includes('API_KEY') || error.message.includes('401')) {
                console.error('\n💡 Fix: Check your GEMINI_API_KEY is valid');
                console.error('   Get a new key at: https://makersuite.google.com/app/apikey');
            } else if (error.message.includes('404') || error.message.includes('not found')) {
                console.error('\n💡 Fix: Model name may be incorrect or unavailable');
                console.error('   Try: gemini-1.5-flash, gemini-1.5-pro, or gemini-2.0-flash-exp');
            } else if (error.message.includes('quota') || error.message.includes('429')) {
                console.error('\n💡 Fix: API quota exceeded - wait or upgrade plan');
            }
        }
        
        if (typeof error === 'object' && error !== null) {
            console.error('\nFull error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
        
        process.exit(1);
    }
}

testGemini();
