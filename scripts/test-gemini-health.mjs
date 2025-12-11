#!/usr/bin/env node
/**
 * Gemini API Health Check
 * 
 * Tests that the configured Gemini model is working.
 * Exits with code 0 if healthy, 1 if broken.
 * 
 * Run: node scripts/test-gemini-health.mjs
 * Or in CI: npm run test:gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not set in .env.local');
  process.exit(1);
}

// Prefer GEMINI_MODEL_NAME from env, fallback to parsing lib/ai.ts
let configuredModel = process.env.GEMINI_MODEL_NAME;

if (!configuredModel) {
  const aiTsPath = join(__dirname, '..', 'lib', 'ai.ts');
  const aiTsContent = readFileSync(aiTsPath, 'utf-8');
  const modelMatch = aiTsContent.match(/model:\s*['"]([^'"]+)['"]/);
  
  if (!modelMatch) {
    console.error('❌ Could not find model name in lib/ai.ts or GEMINI_MODEL_NAME env var');
    process.exit(1);
  }
  
  configuredModel = modelMatch[1];
}

console.log(`🔍 Testing configured model: ${configuredModel}`);

const genAI = new GoogleGenerativeAI(apiKey);

try {
  const model = genAI.getGenerativeModel({ model: configuredModel });
  const result = await model.generateContent('Reply with only the word "ok"');
  const response = await result.response;
  const text = response.text().trim().toLowerCase();
  
  if (text.includes('ok')) {
    console.log(`✅ Gemini API healthy - model "${configuredModel}" responding`);
    process.exit(0);
  } else {
    console.log(`⚠️  Model responded but with unexpected output: "${text}"`);
    process.exit(0); // Still consider this healthy
  }
  
} catch (error) {
  console.error(`❌ Gemini API BROKEN with model "${configuredModel}"`);
  console.error(`   Error: ${error.message}\n`);
  
  if (error.message.includes('404') || error.message.includes('not found')) {
    console.error('🔧 MODEL NOT FOUND - Google may have changed their models again.');
    console.error('   Run this to find working models:');
    console.error('   node scripts/test-model-names.mjs\n');
  }
  
  process.exit(1);
}
