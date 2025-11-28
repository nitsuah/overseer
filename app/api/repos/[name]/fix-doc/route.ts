
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GitHubClient } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { parseGitHubError, getOrgAuthInstructions } from '@/lib/github-errors';
import fs from 'fs/promises';
import path from 'path';
import logger from '@/lib/log';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    const params = await props.params;
    let fullName = ''; // Declare in outer scope for error handling
    
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
        
        logger.debug('[fix-doc] Request details:', {
            docType,
            repoName,
            paramsName: params.name
        });
        
        // Always use process.cwd() which should be the project root when Next.js runs
        const templatePath = path.join(process.cwd(), 'templates', `${docType.toUpperCase()}.md`);

        let content = '';
        try {
            content = await fs.readFile(templatePath, 'utf-8');
        } catch (error) {
            logger.warn(`[fix-doc] Template not found:`, {
                docType,
                templatePath,
                cwd: process.cwd(),
                error: error instanceof Error ? error.message : String(error)
            });
            return NextResponse.json({ 
                error: `Template not found for ${docType}. Expected at: ${templatePath}`
            }, { status: 404 });
        }

        // Get repo owner and full name
        const db = getNeonClient();
        const repoRows = await db`SELECT full_name FROM repos WHERE name = ${repoName} LIMIT 1`;
        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }
        fullName = repoRows[0].full_name;
        const owner = fullName.split('/')[0];

        // Initialize GitHub client with session token
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const githubToken = (session as any).accessToken;
        if (!githubToken) throw new Error('GitHub access token not found in session');
        const github = new GitHubClient(githubToken, owner);

        // Create a new branch
        const branchName = `docs/add-${docType.toLowerCase()}-${Date.now()}`;

        // Get SHA of default branch
        // Note: We need to extend GitHubClient to support these operations
        // For now, we'll assume the client has these methods or we'll add them.
        // Actually, let's just use the octokit instance directly if we can, or extend the client.
        // Since I can't easily extend the client in this file without modifying lib/github.ts, 
        // I will modify lib/github.ts first to include createBranch, createFile, createPullRequest.

        // Wait, I should modify lib/github.ts first.
        // But for now I'll write this and then update lib/github.ts

        const prUrl = await github.createPrForFile(
            repoName,
            branchName,
            `${docType.toUpperCase()}.md`,
            content,
            `docs: add ${docType.toUpperCase()}.md`
        );

        return NextResponse.json({ success: true, branch: branchName, prUrl });
    } catch (error: unknown) {
        logger.warn('Error creating PR:', error);
        
        // Parse the error and provide helpful context
        const errorDetails = parseGitHubError(error);
        
        if (errorDetails.type === 'oauth_restriction') {
            const orgName = fullName.split('/')[0];
            const instructions = getOrgAuthInstructions(orgName);
            
            return NextResponse.json({ 
                error: errorDetails.userMessage,
                type: errorDetails.type,
                instructions,
                helpUrl: errorDetails.helpUrl
            }, { status: 403 });
        }
        
        return NextResponse.json({ 
            error: errorDetails.userMessage,
            type: errorDetails.type,
            helpUrl: errorDetails.helpUrl
        }, { status: 500 });
    }
}
