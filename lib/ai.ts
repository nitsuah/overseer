
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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = `You are a technical documentation expert. Analyze the following files from the repository "${repoName}" and provide a concise, high-level summary of what this project does, its tech stack, and its current status.
  
  Format the output as a single paragraph, max 200 words. Focus on the "What" and "Why".
  
  Files provided:
  `;

    for (const [filename, content] of Object.entries(files)) {
        prompt += `\n\n--- ${filename} ---\n${content.slice(0, 5000)}`; // Truncate to avoid huge context
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating summary:', error);
        return null;
    }
}
