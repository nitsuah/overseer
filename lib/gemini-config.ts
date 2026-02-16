/**
 * Gemini AI Configuration
 * 
 * Centralized configuration for Gemini AI models and settings.
 * Run `npm run list-models` to see available models.
 * 
 * Model configuration now uses auto-discovery from gemini-model-discovery.ts
 * to handle Google's frequent model changes.
 */

import { DEFAULT_GEMINI_MODEL, getConfiguredModel } from './gemini-model-discovery';

// Re-export for backward compatibility
export { DEFAULT_GEMINI_MODEL, getConfiguredModel };

/**
 * Default generation configuration for all Gemini requests.
 */
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 2048,
};

/**
 * Generation config for summary generation (shorter responses).
 */
export const SUMMARY_GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 1024,
};
