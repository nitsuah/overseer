import dotenv from 'dotenv';
import logger from '../lib/log';

dotenv.config({ path: '.env.local' });

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        logger.warn('❌ No API key found');
        process.exit(1);
    }
    
    logger.info('Fetching available models from Gemini API...\n');
    
    // Try both v1 and v1beta
    for (const version of ['v1beta', 'v1']) {
        const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
        
        logger.info(`\nTrying ${version} endpoint...`);
        
        try {
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                logger.info(`✅ Success! Available models on ${version}:\n`);
                
                if (data.models && Array.isArray(data.models)) {
                    for (const model of data.models) {
                        const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                        if (supportsGenerate) {
                            logger.info(`✅ ${model.name}`);
                            logger.info(`   Display: ${model.displayName}`);
                            logger.info(`   Methods: ${model.supportedGenerationMethods?.join(', ')}`);
                            logger.info('');
                        }
                    }
                } else {
                    logger.debug('Response:', JSON.stringify(data, null, 2));
                }
                return;
            } else {
                const error = await response.text();
                logger.warn(`❌ ${response.status} ${response.statusText}`);
                logger.warn('Error:', error.substring(0, 200));
            }
        } catch (err) {
            logger.warn(`❌ Error:`, err instanceof Error ? err.message : 'Unknown');
        }
    }
    
    logger.warn('\n❌ Could not fetch models. Possible issues:');
    logger.warn('1. API key is for wrong product (need Gemini API key, not Google Cloud)');
    logger.warn('2. API key lacks permissions');
    logger.warn('3. API key is restricted by IP/domain');
    logger.warn('\n💡 Try:');
    logger.warn('- Go to https://aistudio.google.com/app/apikey');
    logger.warn('- Delete old keys and create a fresh one');
    logger.warn('- Make sure you\'re creating a "Gemini API" key');
}

listAvailableModels();
