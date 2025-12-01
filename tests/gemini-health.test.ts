import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Gemini API Health', () => {
  it('should have a working Gemini model configured', async () => {
    try {
      const { stdout } = await execAsync('node scripts/test-gemini-health.mjs', {
        env: {
          ...process.env,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        },
        timeout: 10000, // 10 second timeout
      });
      
      expect(stdout).toContain('Gemini API healthy');
      expect(stdout).toContain('gemini-2.0-flash-exp');
    } catch (error: unknown) {
      // If script exits with code 1, fail with helpful message
      const execError = error as { code?: number; stdout?: string; stderr?: string };
      if (execError.code === 1) {
        throw new Error(
          `Gemini health check failed!\n\n` +
          `${execError.stdout || ''}\n${execError.stderr || ''}\n\n` +
          `Google may have changed their models again.\n` +
          `Run: npm run find-gemini-models`
        );
      }
      throw error;
    }
  }, 15000); // 15 second test timeout
});
