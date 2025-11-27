import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found');
        process.exit(1);
    }
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        console.log('Fetching available models...\n');
        
        const models = await genAI.listModels();
        
        console.log('Available models that support generateContent:\n');
        
        for await (const model of models) {
            if (model.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`✅ ${model.name}`);
                console.log(`   Display Name: ${model.displayName}`);
                console.log(`   Description: ${model.description}`);
                console.log(`   Input Token Limit: ${model.inputTokenLimit}`);
                console.log(`   Output Token Limit: ${model.outputTokenLimit}`);
                console.log('');
            }
        }
        
    } catch (error) {
        console.error('Error listing models:', error);
        process.exit(1);
    }
}

listModels();
