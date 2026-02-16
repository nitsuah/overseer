import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getConfiguredModel } from '../lib/gemini-model-discovery';

const execAsync = promisify(exec);

describe('Gemini API Health', () => {
  it('should have a working Gemini model configured', async ({ skip }) => {
    // Env is loaded via tests/setup-env.ts; skip if missing instead of failing hard in CI
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Skipping Gemini API Health test: GEMINI_API_KEY not found in environment');
      skip();
      return;
    }
    const model = getConfiguredModel();

    const { stdout } = await execAsync('node scripts/test-gemini-health.mjs', {
      env: {
        ...process.env,
        GEMINI_MODEL_NAME: model,
      },
      timeout: 10000,
    });
    expect(stdout).toContain('Gemini API healthy');
    expect(stdout).toContain(model);
  }, 15000);
});
