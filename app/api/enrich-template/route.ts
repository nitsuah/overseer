import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { generateAIContent } from '@/lib/ai';
import logger from '@/lib/log';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoName, docType, templateContent } = await request.json();
    if (!repoName || !docType || !templateContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get repo details for context
    const db = getNeonClient();
    const repoRows = await db`
      SELECT full_name, description, language, topics, homepage
      FROM repos
      WHERE name = ${repoName}
      LIMIT 1
    `;

    if (repoRows.length === 0) {
      return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
    }

    const repo = repoRows[0];

    // Build enrichment prompt based on doc type
    const enrichedContent = await enrichTemplateWithAI(docType, templateContent, repo);

    return NextResponse.json({ enrichedContent });
  } catch (error: unknown) {
    logger.warn('Error enriching template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function enrichTemplateWithAI(
  docType: string,
  templateContent: string,
  repo: { full_name: string; description: string | null; language: string | null; topics: string[]; homepage: string | null }
): Promise<string> {
  const repoInfo = `
Repository: ${repo.full_name}
Description: ${repo.description || 'No description'}
Primary Language: ${repo.language || 'Unknown'}
Topics: ${repo.topics?.join(', ') || 'None'}
Homepage: ${repo.homepage || 'None'}
`.trim();

  let prompt = '';

  switch (docType.toLowerCase()) {
    case 'codeowners':
      prompt = `You are enriching a CODEOWNERS file template for a GitHub repository.

${repoInfo}

Current CODEOWNERS template:
\`\`\`
${templateContent}
\`\`\`

Task: Replace placeholder @OWNER_USERNAME with the actual repository owner username from the full_name.
Keep all the existing structure and comments intact.
Only modify the @OWNER_USERNAME placeholders - replace them with @${repo.full_name.split('/')[0]}

Return ONLY the updated CODEOWNERS file content, with no additional explanation or markdown formatting.`;
      break;

    default:
      // For unsupported types, return template as-is
      return templateContent;
  }

  try {
    const enriched = await generateAIContent(prompt);
    // Strip markdown code fences if present
    return enriched.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
  } catch (error) {
    logger.warn(`AI enrichment failed for ${docType}:`, error);
    return templateContent; // Fallback to original
  }
}
