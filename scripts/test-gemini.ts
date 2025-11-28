import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from '../lib/log';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    logger.info('Testing Gemini API connection...\n');
    logger.info('API Key configured:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');
    
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
            logger.info(`\nTrying model: ${modelName}...`);
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
                
                logger.info(`✅ Success with ${modelName}!`);
                logger.debug('Response:', text);
                logger.info(`\n🎉 Use this model in lib/ai.ts: "${modelName}"`);
                return;
                
            } catch (err) {
                logger.warn(`❌ ${modelName} failed:`, err instanceof Error ? err.message.split('\n')[0] : 'Unknown error');
            }
        }
        
        logger.warn('\n❌ All models failed. Check your API key or try a different region.');
        process.exit(1);
        
    } catch (error) {
        logger.warn('\n❌ Error testing Gemini API:');
        if (error instanceof Error) {
            logger.warn('Name:', error.name);
            logger.warn('Message:', error.message);
            
            // Provide specific guidance
            if (error.message.includes('API_KEY') || error.message.includes('401')) {
                logger.info('\n💡 Fix: Check your GEMINI_API_KEY is valid');
                logger.info('   Get a new key at: https://makersuite.google.com/app/apikey');
            } else if (error.message.includes('404') || error.message.includes('not found')) {
                logger.info('\n💡 Fix: Model name may be incorrect or unavailable');
                logger.info('   Try: gemini-1.5-flash, gemini-1.5-pro, or gemini-2.0-flash-exp');
            } else if (error.message.includes('quota') || error.message.includes('429')) {
                logger.info('\n💡 Fix: API quota exceeded - wait or upgrade plan');
            }
        }
        
        if (typeof error === 'object' && error !== null) {
            logger.debug('\nFull error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
        
        process.exit(1);
    }
}

testGemini();
