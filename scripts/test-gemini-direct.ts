import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testDirectAPI() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
    }
    
    console.log('Testing direct API calls to Gemini...\n');
    console.log('API Key:', apiKey.substring(0, 20) + '...\n');
    
    // Try different API versions and model names
    const tests = [
        { version: 'v1beta', model: 'gemini-pro' },
        { version: 'v1beta', model: 'gemini-1.5-pro' },
        { version: 'v1beta', model: 'gemini-1.5-flash' },
        { version: 'v1', model: 'gemini-pro' },
        { version: 'v1', model: 'gemini-1.5-pro' },
        { version: 'v1', model: 'gemini-1.5-flash' },
    ];
    
    for (const test of tests) {
        const url = `https://generativelanguage.googleapis.com/${test.version}/models/${test.model}:generateContent?key=${apiKey}`;
        
        try {
            console.log(`Testing ${test.version}/${test.model}...`);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Say hello' }]
                    }]
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ SUCCESS with ${test.version}/${test.model}!`);
                console.log('Response:', JSON.stringify(data, null, 2).substring(0, 200));
                console.log('\n🎉 Use this configuration in lib/ai.ts!\n');
                return;
            } else {
                const error = await response.text();
                console.log(`❌ ${response.status} ${response.statusText}`);
                console.log('   Error:', error.substring(0, 150));
            }
        } catch (err) {
            console.log(`❌ Network error:`, err instanceof Error ? err.message : 'Unknown');
        }
        console.log('');
    }
    
    console.log('❌ All tests failed. The API key may be invalid or restricted.');
}

testDirectAPI();
