/**
 * Multi-Provider AI Configuration
 * 
 * Supports multiple AI providers with automatic failover for redundancy.
 */

import { getConfiguredModel } from './gemini-model-discovery';

export type AIProvider = 'gemini' | 'openai' | 'anthropic';

export interface AIProviderConfig {
  name: AIProvider;
  enabled: boolean;
  apiKey?: string;
  model?: string;
  priority: number; // Lower number = higher priority
}

const DEFAULT_PROVIDER_ORDER: AIProvider[] = ['gemini', 'openai', 'anthropic'];

function isTruthy(value?: string): boolean {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function getProviderOrder(): AIProvider[] {
  const configured = process.env.AI_PROVIDER_ORDER;
  if (!configured) {
    return DEFAULT_PROVIDER_ORDER;
  }

  const parsed = configured
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is AIProvider => DEFAULT_PROVIDER_ORDER.includes(value as AIProvider));

  if (parsed.length === 0) {
    return DEFAULT_PROVIDER_ORDER;
  }

  const missing = DEFAULT_PROVIDER_ORDER.filter((provider) => !parsed.includes(provider));
  return [...parsed, ...missing];
}

function getApiKey(provider: AIProvider): string | undefined {
  switch (provider) {
    case 'gemini':
      return process.env.BYOK_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    case 'openai':
      return process.env.BYOK_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.BYOK_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    default:
      return undefined;
  }
}

function shouldDeprioritizeGeminiForQuota(): boolean {
  return isTruthy(process.env.AI_DEPRIORITIZE_GEMINI_ON_QUOTA)
    && isTruthy(process.env.GEMINI_QUOTA_EXCEEDED);
}

/**
 * Get available AI providers based on environment configuration.
 * Providers are returned in priority order.
 */
export function getAvailableProviders(): AIProviderConfig[] {
  const providerOrder = getProviderOrder();
  const geminiPriority = shouldDeprioritizeGeminiForQuota()
    ? providerOrder.length + 1
    : providerOrder.indexOf('gemini') + 1;

  const providers: AIProviderConfig[] = [
    {
      name: 'gemini',
      enabled: !!getApiKey('gemini'),
      apiKey: getApiKey('gemini'),
      model: getConfiguredModel(),
      priority: geminiPriority,
    },
    {
      name: 'openai',
      enabled: !!getApiKey('openai'),
      apiKey: getApiKey('openai'),
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      priority: providerOrder.indexOf('openai') + 1,
    },
    {
      name: 'anthropic',
      enabled: !!getApiKey('anthropic'),
      apiKey: getApiKey('anthropic'),
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      priority: providerOrder.indexOf('anthropic') + 1,
    },
  ];

  return providers
    .filter((p) => p.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get the primary (highest priority) AI provider.
 */
export function getPrimaryProvider(): AIProviderConfig | null {
  const providers = getAvailableProviders();
  return providers[0] || null;
}

/**
 * Get fallback providers (all except primary).
 */
export function getFallbackProviders(): AIProviderConfig[] {
  const providers = getAvailableProviders();
  return providers.slice(1);
}
