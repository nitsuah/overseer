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

        // Get repo details
        const db = getNeonClient();
        const repoRows = await db`SELECT full_name FROM repos WHERE name = ${repoName} LIMIT 1`;
        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }
        const fullName = repoRows[0].full_name;
        const owner = fullName.split('/')[0];

        // Initialize GitHub client
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const githubToken = (session as any).accessToken;
        if (!githubToken) throw new Error('GitHub access token not found in session');
        const github = new GitHubClient(githubToken, owner);

        // Get missing community standards
        const csRows = await db`
            SELECT standard_type, status 
            FROM community_standards 
            WHERE repo_name = ${repoName} AND status = 'missing'
        `;

        if (csRows.length === 0) {
            return NextResponse.json({ message: 'No missing standards to fix' }, { status: 200 });
        }

        // Filter standards that have templates
        const standardsWithTemplates = [
            'contributing', 
            'code_of_conduct', 
            'security', 
            'license', 
            'changelog', 
            'issue_template', 
            'pr_template',
            'codeowners',
            'copilot_instructions',
            'funding'
        ];
        const fixableStandards = csRows.filter(row => 
            standardsWithTemplates.includes(row.standard_type)
        );

        if (fixableStandards.length === 0) {
            return NextResponse.json({ 
                message: 'No fixable standards found' 
            }, { status: 200 });
        }

        // Collect files to add
        const filesToAdd: { path: string; content: string }[] = [];
        for (const standard of fixableStandards) {
            let templatePath: string;
            let targetPath: string;

            // Handle special cases for file paths
            if (standard.standard_type === 'codeowners') {
                templatePath = path.join(process.cwd(), 'templates', '.github', 'CODEOWNERS');
                targetPath = '.github/CODEOWNERS';
            } else if (standard.standard_type === 'copilot_instructions') {
                templatePath = path.join(process.cwd(), 'templates', '.github', 'copilot-instructions.md');
                targetPath = '.github/copilot-instructions.md';
            } else if (standard.standard_type === 'funding') {
                templatePath = path.join(process.cwd(), 'templates', '.github', 'FUNDING.yml');
                targetPath = '.github/FUNDING.yml';
            } else {
                templatePath = path.join(process.cwd(), 'templates', `${standard.standard_type.toUpperCase()}.md`);
                targetPath = `${standard.standard_type.toUpperCase()}.md`;
            }

            try {
                const content = await fs.readFile(templatePath, 'utf-8');
                filesToAdd.push({
                    path: targetPath,
                    content
                });
            } catch (error) {
                console.error(`Template not found for ${standard.standard_type}:`, error);
            }
        }

        if (filesToAdd.length === 0) {
            return NextResponse.json({ error: 'No templates found for missing standards' }, { status: 404 });
        }

        // Create branch and PR with all files
        const branchName = `docs/add-community-standards-${Date.now()}`;
        const prUrl = await github.createPrForFiles(
            repoName,
            branchName,
            filesToAdd,
            `docs: add community standards (${filesToAdd.length} files)`
        );

        return NextResponse.json({ 
            success: true, 
            branch: branchName, 
            prUrl,
            count: filesToAdd.length,
            files: filesToAdd.map(f => f.path)
        });
    } catch (error: unknown) {
        console.error('Error creating PR for standards:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
