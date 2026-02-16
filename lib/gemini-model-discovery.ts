/**
 * Gemini Model Discovery and Configuration
 * 
 * Centralized system for managing Gemini model selection with automatic fallback.
 * Handles Google's frequent model changes by auto-discovering working alternatives.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from './log';

/**
 * Primary model candidates to try, in order of preference.
 * Version 2.5 is current as of Feb 2026. Version 3 included for future-proofing.
 */
const MODEL_CANDIDATES = [
  // Version 2.5 (current working model as of Feb 2026)
  'models/gemini-2.5-flash',
  'models/gemini-flash-latest',
  
  // Version 3 (future-proofing for when Google releases it)
  'models/gemini-3-flash',
  'models/gemini-3-flash-latest',
  'gemini-3-flash',
  
  // Version 2.0 fallbacks
  'models/gemini-2.0-flash',
  'models/gemini-2.0-flash-001',
  
  // Pro models (if flash fails)
  'models/gemini-3-pro',
  'models/gemini-2.5-pro',
  'models/gemini-pro-latest',
] as const;

/**
 * Single source of truth for the default Gemini model.
 * Always use this constant instead of hardcoding model strings.
 */
export const DEFAULT_GEMINI_MODEL = MODEL_CANDIDATES[0];

// Cache for discovered working model
let cachedWorkingModel: string | null = null;
let lastDiscoveryTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Get the configured Gemini model name from environment or default.
 * Centralizes environment variable access.
 */
export function getConfiguredModel(): string {
  return process.env.GEMINI_MODEL_NAME || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

/**
 * Test if a specific model is available and working.
 */
async function testModel(apiKey: string, modelName: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Quick test with timeout
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    
    const testPromise = model.generateContent('test');
    await Promise.race([testPromise, timeoutPromise]);
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Auto-discover a working Gemini model by trying candidates in order.
 * Caches the result to avoid excessive API calls.
 */
export async function discoverWorkingModel(apiKey: string): Promise<string | null> {
  const now = Date.now();
  
  // Return cached result if still valid
  if (cachedWorkingModel && (now - lastDiscoveryTime) < CACHE_DURATION) {
    return cachedWorkingModel;
  }
  
  logger.info('[Gemini] Auto-discovering working model...');
  
  // Try configured model first
  const configuredModel = getConfiguredModel();
  if (await testModel(apiKey, configuredModel)) {
    cachedWorkingModel = configuredModel;
    lastDiscoveryTime = now;
    logger.info(`[Gemini] ✓ Configured model works: ${configuredModel}`);
    return configuredModel;
  }
  
  logger.warn(`[Gemini] Configured model "${configuredModel}" failed, trying alternatives...`);
  
  // Try other candidates
  for (const candidate of MODEL_CANDIDATES) {
    if (candidate === configuredModel) continue; // Already tried
    
    logger.info(`[Gemini] Testing: ${candidate}`);
    if (await testModel(apiKey, candidate)) {
      cachedWorkingModel = candidate;
      lastDiscoveryTime = now;
      logger.info(`[Gemini] ✓ Found working model: ${candidate}`);
      return candidate;
    }
  }
  
  logger.error('[Gemini] No working models found among candidates');
  return null;
}

/**
 * Get a working Gemini model, with automatic fallback.
 * Always use this function instead of directly accessing model names.
 * 
 * @param apiKey - Gemini API key
 * @param forceRefresh - Force re-discovery even if cached result exists
 */
export async function getWorkingModel(apiKey: string, forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    cachedWorkingModel = null;
  }
  
  const configuredModel = getConfiguredModel();
  
  // Try configured model first without discovery
  if (!forceRefresh && cachedWorkingModel) {
    return cachedWorkingModel;
  }
  
  // Attempt discovery
  const discovered = await discoverWorkingModel(apiKey);
  
  if (discovered) {
    return discovered;
  }
  
  // Fallback: return configured model even if discovery failed
  // (Let the actual API call fail with proper error handling)
  logger.warn(`[Gemini] Discovery failed, falling back to configured model: ${configuredModel}`);
  return configuredModel;
}

/**
 * Clear the cached working model (useful for testing or forcing refresh).
 */
export function clearModelCache(): void {
  cachedWorkingModel = null;
  lastDiscoveryTime = 0;
}

/**
 * Get all model candidates for testing/debugging.
 */
export function getModelCandidates(): readonly string[] {
  return MODEL_CANDIDATES;
}
