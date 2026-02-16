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

/**
 * Get available AI providers based on environment configuration.
 * Providers are returned in priority order.
 */
export function getAvailableProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [
    {
      name: 'gemini',
      enabled: !!process.env.GEMINI_API_KEY,
      apiKey: process.env.GEMINI_API_KEY,
      model: getConfiguredModel(),
      priority: 1,
    },
    {
      name: 'openai',
      enabled: !!process.env.OPENAI_API_KEY,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      priority: 2,
    },
    {
      name: 'anthropic',
      enabled: !!process.env.ANTHROPIC_API_KEY,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      priority: 3,
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
