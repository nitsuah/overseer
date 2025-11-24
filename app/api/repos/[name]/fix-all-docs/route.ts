
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

        const repoName = params.name;
        const db = getNeonClient();

        // Get missing docs
        const docStatuses = await db`
            SELECT doc_type FROM doc_status 
            WHERE repo_id = (SELECT id FROM repos WHERE name = ${repoName}) 
            AND exists = false
        `;

        // Also check for docs that might not even be in the status table yet
        // But for now rely on what we know is missing

        const requiredDocs = ['readme', 'roadmap', 'tasks', 'metrics'];
        const existingDocTypes = new Set(
            (await db`SELECT doc_type FROM doc_status WHERE repo_id = (SELECT id FROM repos WHERE name = ${repoName}) AND exists = true`)
                .map(d => d.doc_type)
        );

        const missingDocs = requiredDocs.filter(d => !existingDocTypes.has(d));

        if (missingDocs.length === 0) {
            return NextResponse.json({ message: 'No missing docs to fix' });
        }

        const filesToCreate = [];
        for (const docType of missingDocs) {
            const templatePath = path.join(process.cwd(), 'templates', `${docType.toUpperCase()}.md`);
            try {
                const content = await fs.readFile(templatePath, 'utf-8');
                filesToCreate.push({
                    path: `${docType.toUpperCase()}.md`,
                    content
                });
            } catch (e) {
                console.warn(`Template for ${docType} not found`);
            }
        }

        if (filesToCreate.length === 0) {
            return NextResponse.json({ error: 'No templates found for missing docs' }, { status: 400 });
        }

        // Get repo owner
        const repoRows = await db`SELECT full_name FROM repos WHERE name = ${repoName} LIMIT 1`;
        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }
        const fullName = repoRows[0].full_name;
        const owner = fullName.split('/')[0];

        // Initialize GitHub client
        const githubToken = (session as any).accessToken;
        if (!githubToken) throw new Error('GitHub access token not found in session');
        const github = new GitHubClient(githubToken, owner);

        const branchName = `docs/add-missing-docs-${Date.now()}`;

        const prUrl = await github.createPrForFiles(
            repoName,
            branchName,
            filesToCreate,
            `docs: add missing documentation (${filesToCreate.map(f => f.path).join(', ')})`
        );

        return NextResponse.json({ success: true, prUrl, count: filesToCreate.length });
    } catch (error: any) {
        console.error('Error fixing all docs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
