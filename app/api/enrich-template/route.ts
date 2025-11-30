import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { generateAIContent } from '@/lib/ai';
import logger from '@/lib/log';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log('[enrich-template] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[enrich-template] Request body:', { 
      repoName: body.repoName, 
      docType: body.docType, 
      templateContentLength: body.templateContent?.length 
    });

    const { repoName, docType, templateContent } = body;
    if (!repoName || !docType || !templateContent) {
      console.log('[enrich-template] Missing required fields:', { repoName: !!repoName, docType: !!docType, templateContent: !!templateContent });
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
      console.log('[enrich-template] Repo not found:', repoName);
      return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
    }

    const repo = repoRows[0];
    console.log('[enrich-template] Repo found:', repo.full_name, 'docType:', docType);

    // Build enrichment prompt based on doc type
    const enrichedContent = await enrichTemplateWithAI(docType, templateContent, repo);
    console.log('[enrich-template] Success, enriched content length:', enrichedContent?.length);

    return NextResponse.json({ enrichedContent });
  } catch (error: unknown) {
    logger.warn('Error enriching template:', error);
    console.error('[enrich-template] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function enrichTemplateWithAI(
  docType: string,
  templateContent: string,
  repo: { full_name: string; description: string | null; language: string | null; topics: string[]; homepage: string | null }
): Promise<string> {
  console.log('[enrichTemplateWithAI] Starting enrichment for docType:', docType);
  
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
      console.log('[enrichTemplateWithAI] Building CODEOWNERS prompt');
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
      console.log('[enrichTemplateWithAI] Unsupported docType, returning template as-is');
      // For unsupported types, return template as-is
      return templateContent;
  }

  try {
    console.log('[enrichTemplateWithAI] Calling generateAIContent...');
    const enriched = await generateAIContent(prompt);
    console.log('[enrichTemplateWithAI] AI response received, length:', enriched?.length);
    // Strip markdown code fences if present
    const cleaned = enriched.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
    console.log('[enrichTemplateWithAI] After cleaning, length:', cleaned?.length);
    return cleaned;
  } catch (error) {
    logger.warn(`AI enrichment failed for ${docType}:`, error);
    console.error('[enrichTemplateWithAI] Error:', error);
    return templateContent; // Fallback to original
  }
}
