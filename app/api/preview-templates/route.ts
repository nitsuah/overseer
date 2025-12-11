import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';
import { detectTemplateLanguage } from '@/lib/detectLanguage';

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
  const startTime = Date.now();
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docTypes, repoName } = await request.json();
    console.log(`[preview-templates] Request received: ${docTypes?.length} types for ${repoName}`);
    if (!docTypes || !Array.isArray(docTypes)) {
      return NextResponse.json({ error: 'docTypes array required' }, { status: 400 });
    }

    const previews: Array<{ path: string; content: string; originalContent?: string; docType: string; type: 'doc' | 'practice'; practiceType?: string }> = [];

    // Fetch repo context once for all templates
    interface RepoContext {
      language: string;
      owner: string;
      repo: string;
      hasWorkflows: boolean;
      workflowFiles: string[];
      packageManager?: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry' | 'cargo' | 'go';
      hasDocker: boolean;
      hasTests: boolean;
      templateLanguage?: 'python' | 'javascript';
    }
    
    const repoContext: RepoContext = {
      language: 'javascript',
      owner: '',
      repo: '',
      hasWorkflows: false,
      workflowFiles: [],
      hasDocker: false,
      hasTests: false,
    };

    if (repoName && session?.accessToken) {
      console.log('[preview-templates] Fetching repo context for:', repoName);
      try {
        const octokit = new Octokit({ auth: session.accessToken });
        const [owner, repo] = repoName.split('/');
        console.log('[preview-templates] Split into owner/repo:', { owner, repo });
        repoContext.owner = owner;
        repoContext.repo = repo;
        
        // Get repo metadata
        const { data: repoData } = await octokit.repos.get({ owner, repo });
        repoContext.language = repoData.language?.toLowerCase() || 'javascript';
        
        // Check for workflows
        try {
          const { data: workflowsData } = await octokit.repos.getContent({
            owner,
            repo,
            path: '.github/workflows',
          });
          if (Array.isArray(workflowsData)) {
            repoContext.hasWorkflows = true;
            repoContext.workflowFiles = workflowsData.map(f => f.name);
          }
        } catch {
          // No workflows folder
        }
        
        // Detect package manager from root files
        try {
          const { data: rootFiles } = await octokit.repos.getContent({ owner, repo, path: '' });
          if (Array.isArray(rootFiles)) {
            const fileNames = rootFiles.map(f => f.name);
            if (fileNames.includes('package-lock.json')) repoContext.packageManager = 'npm';
            else if (fileNames.includes('yarn.lock')) repoContext.packageManager = 'yarn';
            else if (fileNames.includes('pnpm-lock.yaml')) repoContext.packageManager = 'pnpm';
            else if (fileNames.includes('requirements.txt') || fileNames.includes('setup.py')) repoContext.packageManager = 'pip';
            else if (fileNames.includes('pyproject.toml')) repoContext.packageManager = 'poetry';
            else if (fileNames.includes('Cargo.toml')) repoContext.packageManager = 'cargo';
            else if (fileNames.includes('go.mod')) repoContext.packageManager = 'go';
            
            repoContext.hasDocker = fileNames.includes('Dockerfile') || fileNames.includes('docker-compose.yml');
            repoContext.hasTests = fileNames.includes('pytest.ini') || fileNames.includes('vitest.config.ts') || 
                                   fileNames.includes('jest.config.js') || fileNames.includes('test');
          }
        } catch {
          // Could not fetch root files
        }
      } catch (error) {
        console.warn(`Could not fetch repo context for ${repoName}:`, error);
      }
    }

    const repoLanguage = repoContext.language;

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
      // gitignore, pre_commit_hooks, testing_framework, and linting are handled specially below based on language
    };
    
    for (const docType of docTypes) {
      const normalized = String(docType).toLowerCase();
      let filename = TEMPLATE_FILES[normalized];
      let templateSourcePath: string | undefined; // Path to template file in templates/ directory
      
      // Normalize language for template selection
      // Map GitHub language to template category
      const getTemplateLanguage = (lang: string): 'python' | 'javascript' | 'other' => {
        const lower = lang.toLowerCase();
        
        // Python and Python-like
        if (['python', 'jupyter notebook'].includes(lower)) return 'python';
        
        // JavaScript/TypeScript and web
        if (['javascript', 'typescript', 'html', 'css'].includes(lower)) return 'javascript';
        
        // Everything else uses JavaScript templates as default
        return 'javascript';
      };
      
      const templateLang = getTemplateLanguage(repoLanguage);
      // Override with file-based detection when available
      const detectedLang = repoContext.owner && repoContext.repo ? await (async () => {
        const octokit = new Octokit({ auth: (await auth())?.accessToken });
        try { return await detectTemplateLanguage(octokit, repoContext.owner, repoContext.repo); } catch { return 'other'; }
      })() : 'other';
      const isMixed = detectedLang === 'mixed';
      if (detectedLang === 'python') {
        repoContext.templateLanguage = 'python';
      } else if (detectedLang === 'javascript') {
        repoContext.templateLanguage = 'javascript';
      }
      const isPython = templateLang === 'python';
      
      // Special case: docker
      if (normalized === 'docker') {
        // Always show Dockerfile
        templateSourcePath = path.join('docker', 'Dockerfile');
        filename = 'Dockerfile';
        
        // Also include docker-compose.yml preview if template exists
        try {
          const composeTemplatePath = path.join(process.cwd(), 'templates', 'docker', 'docker-compose.yml');
          const composeContent = await fs.readFile(composeTemplatePath, 'utf-8');
          previews.push({
            path: 'docker-compose.yml',
            content: composeContent,
            docType: normalized,
            type: 'practice',
            practiceType: normalized,
          });
        } catch {
          // If compose template missing, silently skip
        }
      }

      // Special case: gitignore - choose based on repo language
      if (normalized === 'gitignore') {
        if (isPython) {
          templateSourcePath = path.join('gitignore', '.gitignore-python');
        } else {
          templateSourcePath = path.join('gitignore', '.gitignore');
        }
        filename = '.gitignore';
      }
      
      // Special case: pre_commit_hooks - choose based on repo language
      if (normalized === 'pre_commit_hooks') {
        if (isPython) {
          templateSourcePath = path.join('pre-commit', '.pre-commit-config-python.yaml');
        } else {
          templateSourcePath = path.join('pre-commit', '.pre-commit-config.yaml');
        }
        filename = '.pre-commit-config.yaml';
      }
      
      // Special case: testing_framework - choose based on repo language
      if (normalized === 'testing_framework') {
        if (isPython) {
          templateSourcePath = path.join('testing', 'pytest.ini');
          filename = 'pytest.ini';
        } else {
          templateSourcePath = path.join('testing', 'vitest.config.ts');
          filename = 'vitest.config.ts';
        }
      }
      
      // Special case: linting - choose based on repo language
      if (normalized === 'linting') {
        if (isMixed) {
          // Push both options for mixed repos
          try {
            const pyContent = await fs.readFile(path.join(process.cwd(), 'templates', 'linting', 'pyproject.toml'), 'utf-8');
            previews.push({ path: 'pyproject.toml', content: pyContent, docType: normalized, type: 'practice', practiceType: normalized });
          } catch {}
          try {
            const jsContent = await fs.readFile(path.join(process.cwd(), 'templates', 'linting', 'eslint.config.mjs'), 'utf-8');
            previews.push({ path: 'eslint.config.mjs', content: jsContent, docType: normalized, type: 'practice', practiceType: normalized });
          } catch {}
          // Skip single-file return; both options added
          continue;
        }
        if (isPython) {
          templateSourcePath = path.join('linting', 'pyproject.toml');
          filename = 'pyproject.toml';
        } else {
          templateSourcePath = path.join('linting', 'eslint.config.mjs');
          filename = 'eslint.config.mjs';
        }
      }
      
      // Special case: deploy_badge needs to fetch existing README and insert badge
      if (!filename && (normalized === 'netlify_badge' || normalized === 'deploy_badge')) {
        let content = '';
        let originalContent = '';
        
        // Try to fetch existing README from GitHub
        if (repoContext.owner && repoContext.repo && session?.accessToken) {
          try {
            const octokit = new Octokit({ auth: session.accessToken });
            
            const { data } = await octokit.repos.getContent({
              owner: repoContext.owner,
              repo: repoContext.repo,
              path: 'README.md',
            });
            
            if ('content' in data) {
              const existingReadme = Buffer.from(data.content, 'base64').toString('utf-8');
              originalContent = existingReadme; // Store original for diff
              
              // Insert deployment badge after title (first # line)
              // Skip any blank lines immediately after the heading
              const lines = existingReadme.split('\n');
              let insertIndex = 0;
              let foundHeading = false;
              
              // Find first # heading
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('#')) {
                  insertIndex = i + 1;
                  foundHeading = true;
                  
                  // Skip blank lines and TL;DR lines after heading
                  while (insertIndex < lines.length && 
                         (lines[insertIndex].trim() === '' || 
                          lines[insertIndex].trim().startsWith('**TL;DR'))) {
                    insertIndex++;
                  }
                  
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
              
              // Use detected workflow from repo context
              let workflowFile = 'deploy.yml'; // default fallback
              if (repoContext.hasWorkflows && repoContext.workflowFiles.length > 0) {
                // Priority order for deployment workflows
                const deployWorkflows = ['deploy.yml', 'deploy.yaml', 'cd.yml', 'cd.yaml', 'production.yml', 'production.yaml', 'main.yml', 'main.yaml'];
                const foundWorkflow = repoContext.workflowFiles.find((filename) =>
                  deployWorkflows.includes(filename.toLowerCase())
                );
                if (foundWorkflow) {
                  workflowFile = foundWorkflow;
                }
              }
              
              // Insert badge section with actual repo owner/name and detected workflow
              const badgeSection = [
                '',
                '<!-- Deployment Status -->',
                `[![Deploy Status](https://github.com/${repoContext.owner}/${repoContext.repo}/actions/workflows/${workflowFile}/badge.svg)](https://github.com/${repoContext.owner}/${repoContext.repo}/actions)`,
                ''
              ];
              
              lines.splice(insertIndex, 0, ...badgeSection);
              content = lines.join('\n');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(
              `[deploy_badge] Failed to fetch README for ${repoName}:`,
              errorMessage,
              error
            );
            // Content will remain empty and fall through to fallback
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
      
      // Use templateSourcePath if set (for language-specific templates), otherwise use filename
      const templateFilePath = path.join(process.cwd(), 'templates', templateSourcePath || filename);
      
      try {
        const content = await fs.readFile(templateFilePath, 'utf-8');
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

    const elapsed = Date.now() - startTime;
    console.log(`[preview-templates] Completed in ${elapsed}ms, returning ${previews.length} files`);
    return NextResponse.json({ previews });
  } catch (error) {
    console.error('Error fetching template previews:', error);
    return NextResponse.json({ error: 'Failed to fetch previews' }, { status: 500 });
  }
}
