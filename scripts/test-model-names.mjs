// Test different model names to find what works
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY environment variable not set');
  process.exit(1);
}

const modelsToTry = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash-latest',
  'gemini-pro',
  'gemini-pro-vision',
  'gemini-2.0-flash-exp',
  'models/gemini-1.5-pro',
  'models/gemini-1.5-flash',
];

const genAI = new GoogleGenerativeAI(apiKey);

console.log('🔍 Testing model names...\n');

for (const modelName of modelsToTry) {
  try {
    console.log(`Testing: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say "hello" if you can hear me');
    const response = await result.response;
    const text = response.text();
    console.log(`✅ ${modelName} - SUCCESS`);
    console.log(`   Response: ${text.substring(0, 50)}...\n`);
    
    // If we found one that works, we can stop
    console.log(`\n🎉 Found working model: ${modelName}`);
    process.exit(0);
    
  } catch (error) {
    console.log(`❌ ${modelName} - FAILED`);
    if (error.message) {
      console.log(`   Error: ${error.message.substring(0, 100)}...\n`);
    } else {
      console.log(`   Error: ${error}\n`);
    }
  }
}

console.log('\n❌ No working models found.');
process.exit(1);
