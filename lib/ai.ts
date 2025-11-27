
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateRepoSummary(
    repoName: string,
    files: Record<string, string>
): Promise<string | null> {
    if (!genAI) {
        console.warn('GEMINI_API_KEY not configured');
        return null;
    }

    try {
        // Use gemini-2.5-flash (latest stable fast model)
        // Old models (gemini-pro, gemini-1.5-*) have been deprecated as of 2025
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        });

        let prompt = `You are an expert Technical Product Manager.
Analyze the following files from the repository "${repoName}".

Output a concise, 2-sentence summary of what this project does and who it is for.
Do not use marketing fluff. Be technical and precise.

Files provided:
`;

        for (const [filename, content] of Object.entries(files)) {
            prompt += `\n\n--- ${filename} ---\n${content.slice(0, 5000)}`; // Truncate to avoid huge context
        }

        const result = await model.generateContent(prompt);
        
        // Handle both sync and async response
        const response = result.response;
        const text = response.text();
        
        if (!text || text.trim().length === 0) {
            console.error('Empty response from Gemini API');
            return 'Summary unavailable (Empty API Response)';
        }
        
        return text;
    } catch (error) {
        // Enhanced error logging for debugging
        console.error('Gemini API Error:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        // Check if error has additional details (API errors often have status/statusText)
        if (typeof error === 'object' && error !== null) {
            console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
        
        // Return more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                return 'Summary unavailable (Invalid API Key)';
            }
            if (error.message.includes('404') || error.message.includes('not found')) {
                return 'Summary unavailable (Model Not Found - Check API Version)';
            }
            if (error.message.includes('quota') || error.message.includes('limit')) {
                return 'Summary unavailable (API Quota Exceeded)';
            }
        }
        
        return 'Summary unavailable (AI Service Error)';
    }
}

export async function generateMissingDoc(
    docType: 'roadmap' | 'tasks',
    contextFiles: string
): Promise<string> {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

        const prompts = {
            roadmap: "Based on the code structure, draft a high-level ROADMAP.md with 3 quarterly goals.",
            tasks: "Based on the TODOs in the code, draft a TASKS.md checklist."
        };

        const prompt = `${prompts[docType]}
Context: ${contextFiles}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from Gemini API');
        }
        
        return text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }
        if (typeof error === 'object' && error !== null) {
            console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
        
        // Throw with more context
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                throw new Error('Invalid Gemini API Key');
            }
            if (error.message.includes('404') || error.message.includes('not found')) {
                throw new Error('Gemini model not found - check API version and model name');
            }
            if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new Error('Gemini API quota exceeded');
            }
        }
        
        throw new Error('Failed to generate documentation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}
