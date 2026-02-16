/**
 * Gemini AI Configuration
 * 
 * Centralized configuration for Gemini AI models and settings.
 * Run `npm run list-models` to see available models.
 */

/**
 * Default Gemini model for all AI operations.
 * Using models/gemini-2.5-flash for fast responses with latest features.
 * 
 * Alternative models:
 * - models/gemini-2.5-pro: More capable but slower
 * - models/gemini-2.0-flash: Stable 2.0 version
 * - models/gemini-flash-latest: Always uses latest flash model
 */
export const DEFAULT_GEMINI_MODEL = 'models/gemini-2.5-flash';

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
