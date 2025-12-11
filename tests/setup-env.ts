import dotenv from 'dotenv';
import path from 'path';

// Load envs only for local runs (skip in CI)
if (!process.env.CI) {
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  dotenv.config({ path: localEnvPath, override: true });
  // Fallback to .env without overriding values from .env.local
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath, override: false });
}

// Basic sanity logging for debug runs (not noisy in CI)
if (!process.env.CI && process.env.VITEST_DEBUG) {

  console.log('[vitest setup] Loaded env:', {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    GEMINI_MODEL_NAME: process.env.GEMINI_MODEL_NAME,
  });
}
