import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Gemini API Health', () => {
  it('should have a working Gemini model configured', async () => {
    // Env is loaded via tests/setup-env.ts; fail clearly if missing
    expect(process.env.GEMINI_API_KEY, 'GEMINI_API_KEY must be set in .env.local').toBeTruthy();
    const model = process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp';

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
