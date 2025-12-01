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

        const { practiceType, content: providedContent, path: providedPath } = await request.json();
        const repoName = params.name;

        logger.debug('[fix-best-practice] Request details:', {
            practiceType,
            repoName,
            hasProvidedContent: !!providedContent,
            providedPath
        });

        // Get repo details
        const db = getNeonClient();
        const repoRows = await db`SELECT full_name FROM repos WHERE name = ${repoName} LIMIT 1`;
        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }
        fullName = repoRows[0].full_name;
        const owner = fullName.split('/')[0];

        // Initialize GitHub client
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const githubToken = (session as any).accessToken;
        if (!githubToken) throw new Error('GitHub access token not found in session');
        const github = new GitHubClient(githubToken, owner);

        const filesToAdd: { path: string; content: string }[] = [];
        let branchName: string;
        let commitMessage: string;

        // If content provided from modal, use it directly
        if (providedContent && providedPath) {
            filesToAdd.push({ path: providedPath, content: providedContent });
            branchName = `chore/add-${practiceType}-${Date.now()}`;
            commitMessage = `chore: add ${practiceType}`;
        } else {
            // Fallback: read from template files
            // Handle different practice types
            switch (practiceType) {
                case 'dependabot': {
                    const templatePath = path.join(process.cwd(), 'templates', '.github', 'dependabot.yml');
                    const content = await fs.readFile(templatePath, 'utf-8');
                    filesToAdd.push({
                        path: '.github/dependabot.yml',
                        content
                    });
                    branchName = `chore/add-dependabot-${Date.now()}`;
                    commitMessage = 'chore: add Dependabot configuration for automatic dependency updates';
                    break;
                }

                case 'env_template': {
                    const templatePath = path.join(process.cwd(), 'templates', '.env.example');
                    const content = await fs.readFile(templatePath, 'utf-8');
                    filesToAdd.push({
                        path: '.env.example',
                        content
                    });
                    branchName = `chore/add-env-template-${Date.now()}`;
                    commitMessage = 'chore: add environment variables template';
                    break;
                }

                case 'docker': {
                    const dockerfilePath = path.join(process.cwd(), 'templates', 'Dockerfile');
                    const dockerComposeePath = path.join(process.cwd(), 'templates', 'docker-compose.yml');
                    const dockerfileContent = await fs.readFile(dockerfilePath, 'utf-8');
                    const dockerComposeContent = await fs.readFile(dockerComposeePath, 'utf-8');
                    filesToAdd.push(
                        {
                            path: 'Dockerfile',
                            content: dockerfileContent
                        },
                        {
                        path: 'docker-compose.yml',
                        content: dockerComposeContent
                    }
                );
                branchName = `chore/add-docker-${Date.now()}`;
                commitMessage = 'chore: add Docker configuration';
                break;
            }

            case 'netlify_badge': {
                // Special case: modify existing README
                try {
                    const readme = await github.getFileContent(repoName, 'README.md');
                    if (!readme) {
                        return NextResponse.json({ error: 'README.md not found' }, { status: 404 });
                    }

                    // Check if badge already exists
                    if (readme.includes('api.netlify.com/api/v1/badges')) {
                        return NextResponse.json({ message: 'Netlify badge already exists in README' }, { status: 200 });
                    }

                    // Check if netlify.toml exists
                    const hasNetlify = await github.getFileContent(repoName, 'netlify.toml');
                    if (!hasNetlify) {
                        return NextResponse.json({ error: 'netlify.toml not found - cannot determine site ID' }, { status: 400 });
                    }

                    // Add badge at the top of README (after title if exists)
                    const lines = readme.split('\n');
                    const badgeMarkdown = `[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)\n`;
                    
                    // Find first non-empty line (usually title)
                    let insertIndex = 0;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].trim().startsWith('#')) {
                            insertIndex = i + 1;
                            break;
                        }
                    }

                    lines.splice(insertIndex, 0, '', badgeMarkdown);
                    const newReadme = lines.join('\n');

                    filesToAdd.push({
                        path: 'README.md',
                        content: newReadme
                    });
                    branchName = `docs/add-netlify-badge-${Date.now()}`;
                    commitMessage = 'docs: add Netlify deployment status badge to README';
                } catch (error) {
                    logger.warn('Error adding Netlify badge:', error);
                    return NextResponse.json({ error: 'Failed to add Netlify badge' }, { status: 500 });
                }
                break;
            }

            default:
                return NextResponse.json({ error: `Unsupported practice type: ${practiceType}` }, { status: 400 });
            }
        }

        if (filesToAdd.length === 0) {
            return NextResponse.json({ error: 'No files to add' }, { status: 400 });
        }

        // Create branch and PR
        const prUrl = await github.createPrForFiles(
            repoName,
            branchName,
            filesToAdd,
            commitMessage
        );

        return NextResponse.json({ 
            success: true, 
            branch: branchName, 
            prUrl,
            count: filesToAdd.length,
            files: filesToAdd.map(f => f.path)
        });
    } catch (error: unknown) {
        logger.warn('Error creating PR for best practice:', error);
        
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
