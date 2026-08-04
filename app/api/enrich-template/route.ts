import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { enrichTemplateWithAI } from '@/lib/template-enricher';
import type { RepoContext } from '@/lib/template-enricher';
import logger from '@/lib/log';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoName, docType, templateContent } = body;

    if (!repoName || !docType || !templateContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getNeonClient();
    const repoRows = await db`
      SELECT full_name, description, language, topics, homepage, created_at
      FROM repos
      WHERE name = ${repoName}
      LIMIT 1
    `;

    if (repoRows.length === 0) {
      return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
    }

    const repo = repoRows[0] as RepoContext;
    const enrichedContent = await enrichTemplateWithAI(docType, templateContent, repo);

    return NextResponse.json({ enrichedContent });
  } catch (error: unknown) {
    logger.warn('Error enriching template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
