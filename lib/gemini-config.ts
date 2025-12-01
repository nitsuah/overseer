/**
 * Gemini AI Configuration
 * 
 * Centralized configuration for Gemini AI models and settings.
 * Run `npm run list-models` to see available models.
 */

/**
 * Default Gemini model for all AI operations.
 * Using gemini-2.0-flash-exp for fast responses with experimental features.
 * 
 * Alternative models:
 * - gemini-1.5-pro: More capable but slower
 * - gemini-1.5-flash: Faster, good for most tasks
 * - gemini-2.0-flash-exp: Experimental, latest features
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash-exp';

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
