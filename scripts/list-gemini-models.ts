import dotenv from 'dotenv';
import logger from '../lib/log';

dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        logger.warn('❌ GEMINI_API_KEY not found');
        process.exit(1);
    }
    
    try {
        logger.info('Fetching available models...\n');
        
        // Use fetch API directly to list models
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        logger.info('Available models that support generateContent:\n');
        
        for (const model of data.models || []) {
            if (model.supportedGenerationMethods?.includes('generateContent')) {
                logger.info(`✅ ${model.name}`);
                logger.info(`   Display Name: ${model.displayName}`);
                logger.info(`   Description: ${model.description}`);
                logger.info(`   Input Token Limit: ${model.inputTokenLimit}`);
                logger.info(`   Output Token Limit: ${model.outputTokenLimit}`);
                logger.info('');
            }
        }
        
    } catch (error) {
        logger.warn('Error listing models:', error);
        process.exit(1);
    }
}

listModels();
