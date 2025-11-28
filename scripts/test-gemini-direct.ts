import dotenv from 'dotenv';
import logger from '../lib/log';

dotenv.config({ path: '.env.local' });

async function testDirectAPI() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        logger.warn('❌ No API key found');
        process.exit(1);
    }
    
    logger.info('Testing direct API calls to Gemini...\n');
    logger.info('API Key:', apiKey.substring(0, 20) + '...\n');
    
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
            logger.info(`Testing ${test.version}/${test.model}...`);
            
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
                logger.info(`✅ SUCCESS with ${test.version}/${test.model}!`);
                logger.debug('Response:', JSON.stringify(data, null, 2).substring(0, 200));
                logger.info('\n🎉 Use this configuration in lib/ai.ts!\n');
                return;
            } else {
                const error = await response.text();
                logger.warn(`❌ ${response.status} ${response.statusText}`);
                logger.warn('   Error:', error.substring(0, 150));
            }
        } catch (err) {
            logger.warn(`❌ Network error:`, err instanceof Error ? err.message : 'Unknown');
        }
        logger.debug('');
    }
    
    logger.warn('❌ All tests failed. The API key may be invalid or restricted.');
}

testDirectAPI();
