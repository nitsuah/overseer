import logger from './log';
import { generateWithFailover } from './ai-failover';
import { getConfiguredModel, DEFAULT_GEMINI_MODEL } from './gemini-model-discovery';

// Ensure test scripts can read the configured Gemini model name
// Uses centralized configuration from gemini-model-discovery
export const GEMINI_MODEL_NAME = getConfiguredModel();

// Explicit object for compatibility with existing code
// Note: The regex in scripts/test-gemini-health.mjs looks for this exact pattern.
export const GEMINI_MODEL = { model: GEMINI_MODEL_NAME };

/**
 * Generate a repository summary using AI with automatic failover.
 * Attempts multiple AI providers if one fails.
 */
export async function generateRepoSummary(
    repoName: string,
    files: Record<string, string>
): Promise<string | null> {
    let prompt = `You are an expert Technical Product Manager.
Analyze the following files from the repository "${repoName}".

Output a concise, 2-sentence summary of what this project does and who it is for.
Do not use marketing fluff. Be technical and precise.

Files provided:
`;

    for (const [filename, content] of Object.entries(files)) {
        prompt += `\n\n--- ${filename} ---\n${content.slice(0, 5000)}`; // Truncate to avoid huge context
    }

    try {
        return await generateWithFailover(prompt, { useShortResponse: true });
    } catch (error) {
        logger.warn('All AI providers failed for repo summary:', error);
        
        // Return more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('API_KEY') || error.message.includes('not configured')) {
                return 'Summary unavailable (No AI Provider Configured)';
            }
            if (error.message.includes('404') || error.message.includes('not found')) {
                return 'Summary unavailable (Model Not Found)';
            }
            if (error.message.includes('quota') || error.message.includes('limit')) {
                return 'Summary unavailable (API Quota Exceeded)';
            }
        }
        
        return 'Summary unavailable (AI Service Error)';
    }
}

/**
 * Generate missing documentation using AI with automatic failover.
 */
export async function generateMissingDoc(
    docType: 'roadmap' | 'tasks',
    contextFiles: string
): Promise<string> {
    const prompts = {
        roadmap: "Based on the code structure, draft a high-level ROADMAP.md with 3 quarterly goals.",
        tasks: "Based on the TODOs in the code, draft a TASKS.md checklist."
    };

    const prompt = `${prompts[docType]}
Context: ${contextFiles}`;

    try {
        return await generateWithFailover(prompt);
    } catch (error) {
        logger.warn('All AI providers failed for missing doc:', error);
        
        // Throw with more context
        if (error instanceof Error) {
            if (error.message.includes('API_KEY') || error.message.includes('not configured')) {
                throw new Error('No AI Provider Configured');
            }
            if (error.message.includes('404') || error.message.includes('not found')) {
                throw new Error('AI model not found');
            }
            if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new Error('AI API quota exceeded');
            }
        }
        
        throw new Error('Failed to generate documentation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Generate AI content with automatic failover across providers.
 */
export async function generateAIContent(prompt: string): Promise<string> {
    try {
        return await generateWithFailover(prompt);
    } catch (error) {
        logger.warn('All AI providers failed for AI content:', error);
        
        // Throw with more context
        if (error instanceof Error) {
            if (error.message.includes('API_KEY') || error.message.includes('not configured')) {
                throw new Error('No AI Provider Configured');
            }
            if (error.message.includes('404') || error.message.includes('not found')) {
                throw new Error('AI model not found');
            }
            if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new Error('AI API quota exceeded');
            }
        }
        
        throw new Error('Failed to generate AI content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}
