
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GitHubClient } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { docType } = await request.json();
        if (!docType) {
            return NextResponse.json({ error: 'Doc type required' }, { status: 400 });
        }

        const repoName = params.name;
        const templatePath = path.join(process.cwd(), 'templates', `${docType.toUpperCase()}.md`);

        let content = '';
        try {
            content = await fs.readFile(templatePath, 'utf-8');
        } catch (e) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Initialize GitHub client
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) throw new Error('GITHUB_TOKEN not configured');
        const github = new GitHubClient(githubToken, 'nitsuah'); // TODO: Get owner dynamically or from session? For now hardcoded as per sync-repos

        // Create a new branch
        const branchName = `docs/add-${docType.toLowerCase()}-${Date.now()}`;
        const defaultBranch = 'main'; // TODO: Get actual default branch

        // Get SHA of default branch
        // Note: We need to extend GitHubClient to support these operations
        // For now, we'll assume the client has these methods or we'll add them.
        // Actually, let's just use the octokit instance directly if we can, or extend the client.
        // Since I can't easily extend the client in this file without modifying lib/github.ts, 
        // I will modify lib/github.ts first to include createBranch, createFile, createPullRequest.

        // Wait, I should modify lib/github.ts first.
        // But for now I'll write this and then update lib/github.ts

        await github.createPrForFile(
            repoName,
            branchName,
            `${docType.toUpperCase()}.md`,
            content,
            `docs: add ${docType.toUpperCase()}.md`
        );

        return NextResponse.json({ success: true, branch: branchName });
    } catch (error: any) {
        console.error('Error creating PR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
