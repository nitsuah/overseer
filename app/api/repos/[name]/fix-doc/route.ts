
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

        const { docType, content: providedContent, path: providedPath } = await request.json();
        if (!docType) {
            return NextResponse.json({ error: 'Doc type required' }, { status: 400 });
        }

        const repoName = params.name;
        
        logger.debug('[fix-doc] Request details:', {
            docType,
            repoName,
            paramsName: params.name,
            hasProvidedContent: !!providedContent,
            providedPath
        });

        // If content is provided from modal (edited), use it directly
        let content = providedContent;
        let targetPath = providedPath;

        if (!content) {
            // Fallback: read from template file
            // Map logical doc types to template filenames
            const TEMPLATE_FILES: Record<string, string> = {
                // Core docs
                readme: 'README.md',
                roadmap: 'ROADMAP.md',
                tasks: 'TASKS.md',
                metrics: 'METRICS.md',
                features: 'FEATURES.md',
                // Community standards
                code_of_conduct: 'CODE_OF_CONDUCT.md',
                contributing: 'CONTRIBUTING.md',
                security: 'SECURITY.md',
                changelog: 'CHANGELOG.md',
                license: 'LICENSE',
                codeowners: path.join('.github', 'CODEOWNERS'),
                copilot: path.join('.github', 'copilot-instructions.md'),
                copilot_instructions: path.join('.github', 'copilot-instructions.md'),
                funding: path.join('.github', 'FUNDING.yml'),
                issue_template: path.join('.github', 'ISSUE_TEMPLATE', 'bug_report.md'),
                issue_templates: path.join('.github', 'ISSUE_TEMPLATE', 'config.yml'),
                pr_template: path.join('.github', 'pull_request_template.md'),
                pull_request_template: path.join('.github', 'pull_request_template.md'),
            };

            const normalized = String(docType).toLowerCase();
            const filename = TEMPLATE_FILES[normalized];
            if (!filename) {
                return NextResponse.json({ 
                    error: `Unknown doc type: ${docType}. No template mapping found.`,
                    supported: Object.keys(TEMPLATE_FILES)
                }, { status: 400 });
            }

            // Always use process.cwd() which should be the project root when Next.js runs
            const templatePath = path.join(process.cwd(), 'templates', filename);

            try {
                content = await fs.readFile(templatePath, 'utf-8');
                targetPath = filename;
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
        const normalized = String(docType).toLowerCase();
        const branchName = `docs/add-${normalized}-${Date.now()}`;

        // Use the target path (either from modal or from template mapping)
        const prUrl = await github.createPrForFile(
            repoName,
            branchName,
            targetPath || filename,
            content,
            `docs: add ${normalized.toUpperCase().replace(/_/g, ' ')}`
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
