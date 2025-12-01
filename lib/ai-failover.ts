/**
 * Multi-Provider AI Client with Automatic Failover
 * 
 * Supports Gemini, OpenAI, and Anthropic with automatic failover.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import logger from './log';
import { getAvailableProviders, AIProviderConfig } from './ai-providers';
import { DEFAULT_GENERATION_CONFIG, SUMMARY_GENERATION_CONFIG } from './gemini-config';

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
 * Generate with Gemini.
 */
async function generateWithGemini(
  provider: AIProviderConfig,
  prompt: string,
  options: { temperature: number; maxTokens: number }
): Promise<string> {
  if (!provider.apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(provider.apiKey);
  const model = genAI.getGenerativeModel({
    model: provider.model!,
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
