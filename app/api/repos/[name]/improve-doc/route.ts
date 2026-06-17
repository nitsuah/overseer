import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GitHubClient } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { generateDocImprovement } from '@/lib/ai';

const DOC_PATHS: Record<string, string> = {
    readme: 'README.md',
    roadmap: 'ROADMAP.md',
    tasks: 'TASKS.md',
    metrics: 'METRICS.md',
    features: 'FEATURES.md',
    contributing: 'CONTRIBUTING.md',
    security: 'SECURITY.md',
    changelog: 'CHANGELOG.md',
    code_of_conduct: 'CODE_OF_CONDUCT.md',
};

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    const params = await props.params;

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docType, userPrompt } = await request.json();
    if (!docType) {
        return NextResponse.json({ error: 'docType required' }, { status: 400 });
    }

    const normalized = String(docType).toLowerCase();
    const docPath = DOC_PATHS[normalized];
    if (!docPath) {
        return NextResponse.json({ error: `Unsupported docType: ${docType}` }, { status: 400 });
    }

    const repoName = params.name;
    const db = getNeonClient();
    const repoRows = await db`SELECT full_name FROM repos WHERE name = ${repoName} LIMIT 1`;
    if (repoRows.length === 0) {
        return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
    }

    const fullName = repoRows[0].full_name as string;
    const owner = fullName.split('/')[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const githubToken = (session as any).accessToken;
    if (!githubToken) {
        return NextResponse.json({ error: 'GitHub access token not found' }, { status: 401 });
    }

    const github = new GitHubClient(githubToken, owner);
    const currentContent = await github.getFileContent(repoName, docPath);
    if (!currentContent) {
        return NextResponse.json({ error: `${docPath} not found in ${fullName}` }, { status: 404 });
    }

    const improved = await generateDocImprovement({
        docType: normalized,
        currentContent,
        repoName: fullName,
        userPrompt: userPrompt || undefined,
    });

    if (!improved) {
        return NextResponse.json({ error: 'AI providers unavailable' }, { status: 503 });
    }

    return NextResponse.json({ original: currentContent, improved });
}
