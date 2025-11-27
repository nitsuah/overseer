import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found');
        process.exit(1);
    }
    
    try {
        console.log('Fetching available models...\n');
        
        // Use fetch API directly to list models
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('Available models that support generateContent:\n');
        
        for (const model of data.models || []) {
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
