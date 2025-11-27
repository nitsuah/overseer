
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
        // Use gemini-1.5-flash per GEMINI.md recommendations
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
        const response = await result.response;
        return response.text();
    } catch (error) {
        // Enhanced error logging for debugging
        console.error('Gemini API Error:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        // Check if error has additional details
        if (typeof error === 'object' && error !== null) {
            console.error('Error details:', JSON.stringify(error, null, 2));
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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompts = {
            roadmap: "Based on the code structure, draft a high-level ROADMAP.md with 3 quarterly goals.",
            tasks: "Based on the TODOs in the code, draft a TASKS.md checklist."
        };

        const prompt = `${prompts[docType]}
Context: ${contextFiles}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }
        if (typeof error === 'object' && error !== null) {
            console.error('Error details:', JSON.stringify(error, null, 2));
        }
        throw new Error('Failed to generate documentation');
    }
}
