## Gemini Fix

The Gemini Integration (lib/ai.ts)This is the "brain" of Overseer. You want Gemini to read your README.md or code files and generate the summaries or missing TASKS.md content.Prerequisite:Get an API Key from Google AI Studio.Install the SDK: npm install @google/genaiThe Code Fix (lib/ai.ts)Here is a robust implementation for your lib/ai.ts file. It includes error handling and a specific "System Instruction" to ensure Gemini acts like a Technical Product Manager.TypeScriptimport { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateRepoSummary(repoName: string, readmeContent: string) {
  try {
    const prompt = `
      You are an expert Technical Product Manager.
      Analyze the following README content for the repository "${repoName}".

      Output a concise, 2-sentence summary of what this project does and who it is for.
      Do not use marketing fluff. Be technical and precise.

      README Content:
      ${readmeContent.substring(0, 10000)} // Truncate to avoid token limits if massive
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Summary unavailable (AI Service Error)";
  }
}

export async function generateMissingDoc(docType: 'roadmap' | 'tasks', contextFiles: string) {
  // This function generates the actual content for your PRs
  const prompts = {
    roadmap: "Based on the code structure, draft a high-level ROADMAP.md with 3 quarterly goals.",
    tasks: "Based on the TODOs in the code, draft a TASKS.md checklist."
  };

  const result = await model.generateContent(`
    ${prompts[docType]}
    Context: ${contextFiles}
  `);

  return result.response.text();
}
1. Connecting the Pipes (.env.local)Update your environment variables to match NextAuth v5's new standard.Code snippet# GitHub Auth (Use the "Local" App credentials here for now)
AUTH_GITHUB_ID=Iv1...
AUTH_GITHUB_SECRET=832...

# NextAuth v5 requires this secret to be set
AUTH_SECRET=run_openssl_rand_base64_32_here

# Google Gemini
GEMINI_API_KEY=AIza...