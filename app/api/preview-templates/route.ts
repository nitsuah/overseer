import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';

// Practice types that represent best practices rather than documentation
const PRACTICE_TYPES = [
  'docker',
  'env_template',
  'dependabot',
  'netlify_badge',
  'deploy_badge',
  'ci_cd',
  'gitignore',
  'pre_commit_hooks',
  'testing_framework',
  'linting',
] as const;

/**
 * Fallback content shown when deploy_badge is requested but the repository's README.md
 * cannot be fetched from GitHub (e.g., repo doesn't exist, network error, or no README).
 * Contains example badge snippets with placeholders that should be replaced with actual values.
 */
const DEPLOY_BADGE_FALLBACK = `# Deployment Badge Preview

⚠️ Could not fetch existing README.md

This change adds a deployment status badge to README.md.

Example badges:

**Netlify:**
[![Netlify Status](https://api.netlify.com/api/v1/badges/<SITE_ID>/deploy-status)](https://app.netlify.com/sites/<SITE_NAME>/deploys)

**Vercel:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=<REPO_URL>)

**GitHub Actions:**
[![Deploy Status](https://github.com/<OWNER>/<REPO>/actions/workflows/deploy.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions)`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docTypes, repoName } = await request.json();
    if (!docTypes || !Array.isArray(docTypes)) {
      return NextResponse.json({ error: 'docTypes array required' }, { status: 400 });
    }

    const previews: Array<{ path: string; content: string; originalContent?: string; docType: string; type: 'doc' | 'practice'; practiceType?: string }> = [];

    const TEMPLATE_FILES: Record<string, string> = {
      readme: 'README.md',
      roadmap: 'ROADMAP.md',
      tasks: 'TASKS.md',
      metrics: 'METRICS.md',
      features: 'FEATURES.md',
      code_of_conduct: 'CODE_OF_CONDUCT.md',
      contributing: 'CONTRIBUTING.md',
      security: 'SECURITY.md',
      changelog: 'CHANGELOG.md',
      license: 'LICENSE',
      // Community standards under .github
      codeowners: path.join('.github', 'CODEOWNERS'),
      copilot: path.join('.github', 'copilot-instructions.md'),
      copilot_instructions: path.join('.github', 'copilot-instructions.md'),
      funding: path.join('.github', 'FUNDING.yml'),
      // Issue/PR templates
      issue_template: path.join('.github', 'ISSUE_TEMPLATE', 'bug_report.md'),
      // Alias for folder-based issue templates config
      issue_templates: path.join('.github', 'ISSUE_TEMPLATE', 'config.yml'),
      pr_template: path.join('.github', 'pull_request_template.md'),
      pull_request_template: path.join('.github', 'pull_request_template.md'),
      // Best practices with files we can preview
      docker: 'Dockerfile',
      env_template: '.env.example',
      dependabot: '.github/dependabot.yml',
      ci_cd: '.github/workflows/ci.yml',
      gitignore: '.gitignore',
      pre_commit_hooks: '.pre-commit-config.yaml',
      testing_framework: 'vitest.config.ts',
      linting: 'eslint.config.mjs',
    };
    
    for (const docType of docTypes) {
      const normalized = String(docType).toLowerCase();
      const filename = TEMPLATE_FILES[normalized];
      
      // Special case: deploy_badge needs to fetch existing README and insert badge
      if (!filename && (normalized === 'netlify_badge' || normalized === 'deploy_badge')) {
        let content = '';
        let originalContent = '';
        
        // Try to fetch existing README from GitHub
        if (repoName && session?.accessToken) {
          try {
            const octokit = new Octokit({ auth: session.accessToken });
            const [owner, repo] = repoName.split('/');
            
            const { data } = await octokit.repos.getContent({
              owner,
              repo,
              path: 'README.md',
            });
            
            if ('content' in data) {
              const existingReadme = Buffer.from(data.content, 'base64').toString('utf-8');
              originalContent = existingReadme; // Store original for diff
              
              // Insert deployment badge after title (first # line)
              // If no heading is found, insert after first non-empty line or at top
              const lines = existingReadme.split('\n');
              let insertIndex = 0;
              let foundHeading = false;
              
              // Find first # heading
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('#')) {
                  insertIndex = i + 1;
                  foundHeading = true;
                  break;
                }
              }
              
              // If no heading found, insert after first non-empty line
              if (!foundHeading) {
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].trim() !== '') {
                    insertIndex = i + 1;
                    break;
                  }
                }
              }
              
              // Detect deployment workflow from repository
              // Look for common workflow files: deploy.yml, cd.yml, production.yml, main.yml
              let workflowFile = 'deploy.yml'; // default fallback
              try {
                const workflowsResponse = await octokit.repos.getContent({
                  owner,
                  repo,
                  path: '.github/workflows',
                });
                
                if (Array.isArray(workflowsResponse.data)) {
                  // Priority order for deployment workflows
                  const deployWorkflows = ['deploy.yml', 'deploy.yaml', 'cd.yml', 'cd.yaml', 'production.yml', 'production.yaml', 'main.yml', 'main.yaml'];
                  const foundWorkflow = workflowsResponse.data.find((file) =>
                    deployWorkflows.includes(file.name.toLowerCase())
                  );
                  if (foundWorkflow) {
                    workflowFile = foundWorkflow.name;
                  }
                }
              } catch {
                // Workflows folder doesn't exist or cannot be accessed, use default
              }
              
              // Insert badge section with actual repo owner/name and detected workflow
              const badgeSection = [
                '',
                '<!-- Deployment Status -->',
                `[![Deploy Status](https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}/badge.svg)](https://github.com/${owner}/${repo}/actions)`,
                ''
              ];
              
              lines.splice(insertIndex, 0, ...badgeSection);
              content = lines.join('\n');
            }
          } catch (error) {
            console.warn(
              `Could not fetch README for deploy_badge (repo: ${repoName}, badge type: ${normalized}):`,
              error
            );
          }
        }
        
        // Fallback if we couldn't fetch README
        if (!content) {
          content = DEPLOY_BADGE_FALLBACK;
        }
        
        previews.push({
          path: 'README.md',
          content,
          originalContent: originalContent || undefined,
          docType: 'README badge',
          type: 'practice',
          practiceType: normalized,
        });
        continue;
      }
      if (!filename) {
        // Skip unknown types silently
        continue;
      }
      const templatePath = path.join(process.cwd(), 'templates', filename);
      
      try {
        const content = await fs.readFile(templatePath, 'utf-8');
        const isPractice = PRACTICE_TYPES.includes(normalized as typeof PRACTICE_TYPES[number]);
        previews.push({
          path: filename.replace(/\\/g, '/'),
          content,
          docType: normalized,
          type: isPractice ? 'practice' : 'doc',
          practiceType: isPractice ? normalized : undefined,
        });
      } catch (error) {
        console.warn(`Template not found for ${docType}:`, error);
      }
    }

    return NextResponse.json({ previews });
  } catch (error) {
    console.error('Error fetching template previews:', error);
    return NextResponse.json({ error: 'Failed to fetch previews' }, { status: 500 });
  }
}
