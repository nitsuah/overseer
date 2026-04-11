import { describe, it, expect, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getConfiguredModel } from '../lib/gemini-model-discovery';
import { getAvailableProviders, getPrimaryProvider } from '../lib/ai-providers';

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

    try {
      const { stdout, stderr } = await execAsync('node scripts/test-gemini-health.mjs', {
        env: { ...process.env, GEMINI_MODEL_NAME: model },
        timeout: 10000,
      });
      if ((stdout + stderr).includes('429 Too Many Requests')) {
        console.warn('Skipping Gemini API Health test: quota exceeded (429)');
        skip();
        return;
      }
      expect(stdout).toContain('Gemini API healthy');
      expect(stdout).toContain(model);
    } catch (error: unknown) {
      const combined = ((error as { stdout?: string; stderr?: string }).stdout ?? '') +
        ((error as { stdout?: string; stderr?: string }).stderr ?? '');
      if (combined.includes('429 Too Many Requests')) {
        console.warn('Skipping Gemini API Health test: quota exceeded (429)');
        skip();
        return;
      }
      throw error;
    }
  }, 15000);
});

describe('AI provider routing', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  function resetProviderEnv(): void {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.BYOK_GEMINI_API_KEY;
    delete process.env.BYOK_OPENAI_API_KEY;
    delete process.env.BYOK_ANTHROPIC_API_KEY;
    delete process.env.AI_PROVIDER_ORDER;
    delete process.env.AI_DEPRIORITIZE_GEMINI_ON_QUOTA;
    delete process.env.GEMINI_QUOTA_EXCEEDED;
  }

  it('uses default ordering when all provider keys are available', () => {
    process.env = { ...originalEnv };
    resetProviderEnv();

    process.env.GEMINI_API_KEY = 'gem-key';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.ANTHROPIC_API_KEY = 'anthropic-key';

    const providers = getAvailableProviders();

    expect(providers.map((provider) => provider.name)).toEqual(['gemini', 'openai', 'anthropic']);
    expect(getPrimaryProvider()?.name).toBe('gemini');
  });

  it('respects configured provider order and BYOK precedence', () => {
    process.env = { ...originalEnv };
    resetProviderEnv();

    process.env.GEMINI_API_KEY = 'gem-default';
    process.env.BYOK_GEMINI_API_KEY = 'gem-byok';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.ANTHROPIC_API_KEY = 'anthropic-key';
    process.env.AI_PROVIDER_ORDER = 'openai,anthropic,gemini';

    const providers = getAvailableProviders();
    const gemini = providers.find((provider) => provider.name === 'gemini');

    expect(providers.map((provider) => provider.name)).toEqual(['openai', 'anthropic', 'gemini']);
    expect(getPrimaryProvider()?.name).toBe('openai');
    expect(gemini?.apiKey).toBe('gem-byok');
  });

  it('deprioritizes gemini when quota controls are enabled', () => {
    process.env = { ...originalEnv };
    resetProviderEnv();

    process.env.GEMINI_API_KEY = 'gem-key';
    process.env.OPENAI_API_KEY = 'openai-key';
    process.env.ANTHROPIC_API_KEY = 'anthropic-key';
    process.env.AI_PROVIDER_ORDER = 'gemini,openai,anthropic';
    process.env.AI_DEPRIORITIZE_GEMINI_ON_QUOTA = 'true';
    process.env.GEMINI_QUOTA_EXCEEDED = 'true';

    const providers = getAvailableProviders();

    expect(providers.map((provider) => provider.name)).toEqual(['openai', 'anthropic', 'gemini']);
    expect(getPrimaryProvider()?.name).toBe('openai');
  });

  it('uses BYOK key over default key for OpenAI', () => {
    process.env = { ...originalEnv };
    resetProviderEnv();

    process.env.OPENAI_API_KEY = 'openai-default';
    process.env.BYOK_OPENAI_API_KEY = 'openai-byok';

    const providers = getAvailableProviders();
    const openai = providers.find((provider) => provider.name === 'openai');

    expect(openai?.apiKey).toBe('openai-byok');
  });

  it('uses BYOK key over default key for Anthropic', () => {
    process.env = { ...originalEnv };
    resetProviderEnv();

    process.env.ANTHROPIC_API_KEY = 'anthropic-default';
    process.env.BYOK_ANTHROPIC_API_KEY = 'anthropic-byok';

    const providers = getAvailableProviders();
    const anthropic = providers.find((provider) => provider.name === 'anthropic');

    expect(anthropic?.apiKey).toBe('anthropic-byok');
  });
});
