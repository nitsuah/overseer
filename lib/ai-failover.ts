/**
 * Multi-Provider AI Client with Automatic Failover
 * 
 * Supports Gemini, OpenAI, and Anthropic with automatic failover.
 * Includes auto-discovery when Gemini models are not found.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import logger from './log';
import { getAvailableProviders, AIProviderConfig } from './ai-providers';

/**
 * Runtime cache for working models (persists across requests in same process)
 */
const workingModelCache = new Map<string, { model: string; lastChecked: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Discover available Gemini models and test them to find working one
 */
async function discoverAndTestGeminiModels(apiKey: string): Promise<string | null> {
  try {
    logger.info('[Gemini Auto-Discovery] Fetching available models from Google API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      logger.warn('[Gemini Auto-Discovery] Failed to fetch models list');
      return null;
    }
    
    const data = await response.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
    const availableModels = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace('models/', ''));
    
    if (availableModels.length === 0) {
      logger.warn('[Gemini Auto-Discovery] No models found');
      return null;
    }
    
    logger.info(`[Gemini Auto-Discovery] Found ${availableModels.length} models: ${availableModels.slice(0, 5).join(', ')}`);
    
    // Test models in order until we find one that works
    const genAI = new GoogleGenerativeAI(apiKey);
    
    for (const modelName of availableModels) {
      try {
        logger.info(`[Gemini Auto-Discovery] Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        await model.generateContent('test');
        
        logger.info(`[Gemini Auto-Discovery] ✅ Found working model: ${modelName}`);
        
        // Cache the working model
        workingModelCache.set('gemini', {
          model: modelName,
          lastChecked: Date.now()
        });
        
        return modelName;
      } catch (error) {
        logger.warn(`[Gemini Auto-Discovery] ❌ Model ${modelName} failed: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    }
    
    logger.warn('[Gemini Auto-Discovery] No working models found');
    return null;
    
  } catch (error) {
    logger.warn('[Gemini Auto-Discovery] Discovery failed:', error);
    return null;
  }
}

/**
 * Get working Gemini model - uses cache or discovers new one
 */
async function getWorkingGeminiModel(apiKey: string, defaultModel: string): Promise<string> {
  // Check cache first
  const cached = workingModelCache.get('gemini');
  if (cached && (Date.now() - cached.lastChecked) < CACHE_TTL) {
    logger.info(`[Gemini] Using cached working model: ${cached.model}`);
    return cached.model;
  }
  
  // Try default model first
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: defaultModel });
    await model.generateContent('test');
    
    // Cache it
    workingModelCache.set('gemini', {
      model: defaultModel,
      lastChecked: Date.now()
    });
    
    return defaultModel;
  } catch {
    logger.warn(`[Gemini] Default model "${defaultModel}" failed, attempting auto-discovery...`);
    
    // Discover and test available models
    const workingModel = await discoverAndTestGeminiModels(apiKey);
    
    if (workingModel) {
      logger.info(`[Gemini] 🔄 Auto-switched to working model: ${workingModel}`);
      return workingModel;
    }
    
    // No working model found - throw to trigger failover
    throw new Error(`No working Gemini models found. Default "${defaultModel}" failed and auto-discovery found no alternatives.`);
  }
}

interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  useShortResponse?: boolean;
}

/**
 * Generate AI content with automatic failover across providers.
 */
export async function generateWithFailover(
  prompt: string,
  options: GenerationOptions = {}
): Promise<string> {
  const providers = getAvailableProviders();
  
  if (providers.length === 0) {
    throw new Error('No AI providers configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY');
  }

  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? (options.useShortResponse ? 1024 : 2048);

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      logger.info(`[AI Failover] Trying provider: ${provider.name}`);
      
      const result = await generateWithProvider(provider, prompt, { temperature, maxTokens });
      
      logger.info(`[AI Failover] Success with provider: ${provider.name}`);
      return result;
    } catch (error) {
      logger.warn(`[AI Failover] Provider ${provider.name} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Continue to next provider
      continue;
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}

/**
 * Generate content using a specific provider.
 */
async function generateWithProvider(
  provider: AIProviderConfig,
  prompt: string,
  options: { temperature: number; maxTokens: number }
): Promise<string> {
  switch (provider.name) {
    case 'gemini':
      return await generateWithGemini(provider, prompt, options);
    case 'openai':
      return await generateWithOpenAI(provider, prompt, options);
    case 'anthropic':
      return await generateWithAnthropic(provider, prompt, options);
    default:
      throw new Error(`Unknown provider: ${provider.name}`);
  }
}

/**
 * Generate with Gemini - auto-discovers and switches to working models.
 */
async function generateWithGemini(
  provider: AIProviderConfig,
  prompt: string,
  options: { temperature: number; maxTokens: number }
): Promise<string> {
  if (!provider.apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Get working model (uses cache, tests default, or discovers new one)
  const workingModel = await getWorkingGeminiModel(provider.apiKey, provider.model!);
  
  const genAI = new GoogleGenerativeAI(provider.apiKey);
  const model = genAI.getGenerativeModel({
    model: workingModel,
    generationConfig: {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text || text.trim().length === 0) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}

/**
 * Generate with OpenAI.
 */
async function generateWithOpenAI(
  provider: AIProviderConfig,
  prompt: string,
  options: { temperature: number; maxTokens: number }
): Promise<string> {
  if (!provider.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: provider.apiKey });
  
  const completion = await openai.chat.completions.create({
    model: provider.model!,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature,
    max_tokens: options.maxTokens,
  });

  const text = completion.choices[0]?.message?.content;

  if (!text || text.trim().length === 0) {
    throw new Error('Empty response from OpenAI');
  }

  return text;
}

/**
 * Generate with Anthropic (Claude).
 */
async function generateWithAnthropic(
  provider: AIProviderConfig,
  prompt: string,
  options: { temperature: number; maxTokens: number }
): Promise<string> {
  if (!provider.apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const anthropic = new Anthropic({ apiKey: provider.apiKey });

  const message = await anthropic.messages.create({
    model: provider.model!,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0]?.type === 'text' ? message.content[0].text : '';

  if (!text || text.trim().length === 0) {
    throw new Error('Empty response from Anthropic');
  }

  return text;
}
