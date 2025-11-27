import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
    }
    
    console.log('Fetching available models from Gemini API...\n');
    
    // Try both v1 and v1beta
    for (const version of ['v1beta', 'v1']) {
        const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
        
        console.log(`\nTrying ${version} endpoint...`);
        
        try {
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success! Available models on ${version}:\n`);
                
                if (data.models && Array.isArray(data.models)) {
                    for (const model of data.models) {
                        const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                        if (supportsGenerate) {
                            console.log(`✅ ${model.name}`);
                            console.log(`   Display: ${model.displayName}`);
                            console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ')}`);
                            console.log('');
                        }
                    }
                } else {
                    console.log('Response:', JSON.stringify(data, null, 2));
                }
                return;
            } else {
                const error = await response.text();
                console.log(`❌ ${response.status} ${response.statusText}`);
                console.log('Error:', error.substring(0, 200));
            }
        } catch (err) {
            console.log(`❌ Error:`, err instanceof Error ? err.message : 'Unknown');
        }
    }
    
    console.log('\n❌ Could not fetch models. Possible issues:');
    console.log('1. API key is for wrong product (need Gemini API key, not Google Cloud)');
    console.log('2. API key lacks permissions');
    console.log('3. API key is restricted by IP/domain');
    console.log('\n💡 Try:');
    console.log('- Go to https://aistudio.google.com/app/apikey');
    console.log('- Delete old keys and create a fresh one');
    console.log('- Make sure you\'re creating a "Gemini API" key');
}

listAvailableModels();
