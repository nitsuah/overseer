/**
 * AI Prompt Chain Builder for Context-Aware Best Practice Fixes
 * Implements multi-stage RAG: Retrieval → Augmentation → Generation
 */

import { GitHubClient } from './github';

export type BestPracticeType = 'deploy_badge' | 'env_template' | 'docker' | 'dependabot' | 'ci_cd' | 'gitignore' | 'pre_commit_hooks' | 'testing_framework' | 'linting';

export interface PromptChainContext {
  repoName: string;
  repoOwner: string;
  language: string | null;
  practiceType: BestPracticeType;
  template: string;
  readme?: string;
  contributing?: string;
  existingFiles?: Record<string, string>;
}

export interface EnrichedContext extends PromptChainContext {
  packageManagers?: string[];
  envVars?: string[];
  buildSteps?: string;
  badges?: string[];
}

/**
 * Fetch repo context: README, CONTRIBUTING, and practice-specific files
 */
export async function fetchRepoContext(
  owner: string,
  repo: string,
  practiceType: BestPracticeType,
  githubToken?: string
): Promise<Partial<EnrichedContext>> {
  const client = new GitHubClient(githubToken || '', owner);
  const context: Partial<EnrichedContext> = {};

  console.log(`[fetchRepoContext] Starting context fetch for ${owner}/${repo}, practice: ${practiceType}`);

  try {
    // Always fetch README (primary context source)
    try {
      console.log(`[fetchRepoContext] Fetching README.md...`);
      const readmeContent = await client.getFileContent(repo, 'README.md');
      if (readmeContent) {
        context.readme = readmeContent;
        console.log(`[fetchRepoContext] README.md fetched successfully (${readmeContent.length} chars)`);
      
      // Extract badges from README for deploy_badge
      if (practiceType === 'deploy_badge') {
        context.badges = extractBadges(readmeContent);
        console.log(`[fetchRepoContext] Extracted ${context.badges.length} badges`);
      }
      
      // Extract build steps for docker
      if (practiceType === 'docker') {
        context.buildSteps = extractBuildSteps(readmeContent);
        console.log(`[fetchRepoContext] Extracted build steps (${context.buildSteps?.length || 0} chars)`);
      }
      
      // Extract env var mentions for env_template
      if (practiceType === 'env_template') {
        context.envVars = extractEnvVarMentions(readmeContent);
        console.log(`[fetchRepoContext] Extracted ${context.envVars.length} env vars`);
      }
      } else {
        console.warn(`[fetchRepoContext] README.md returned empty content`);
      }
    } catch (error) {
      console.warn(`[fetchRepoContext] Failed to fetch README.md:`, error instanceof Error ? error.message : String(error));
    }

    // Fetch CONTRIBUTING.md if available
    try {
      console.log(`[fetchRepoContext] Fetching CONTRIBUTING.md...`);
      const contributingContent = await client.getFileContent(repo, 'CONTRIBUTING.md');
      if (contributingContent) {
        context.contributing = contributingContent;
        console.log(`[fetchRepoContext] CONTRIBUTING.md fetched successfully (${contributingContent.length} chars)`);
      }
    } catch (error) {
      console.log(`[fetchRepoContext] No CONTRIBUTING.md found:`, error instanceof Error ? error.message : String(error));
    }

    // Practice-specific file fetching
    switch (practiceType) {
      case 'env_template':
        // Try to fetch existing .env files
        const envFiles = ['.env', '.env.local', '.env.example'];
        context.existingFiles = {};
        for (const file of envFiles) {
          try {
            const content = await client.getFileContent(repo, file);
            if (content) {
              context.existingFiles[file] = content;
            }
          } catch (_err) {
            // File doesn't exist, continue
          }
        }
        break;

      case 'docker':
        // Check for existing Docker files
        context.existingFiles = {};
        const dockerFiles = ['Dockerfile', 'docker-compose.yml', '.dockerignore'];
        for (const file of dockerFiles) {
          try {
            const content = await client.getFileContent(repo, file);
            if (content) {
              context.existingFiles[file] = content;
            }
          } catch (_err) {
            // File doesn't exist
          }
        }
        break;

      case 'dependabot':
        // Detect package managers from repo files
        context.packageManagers = await detectPackageManagers(client, owner, repo);
        break;

      case 'ci_cd':
        // Detect package managers for CI/CD setup
        context.packageManagers = await detectPackageManagers(client, owner, repo);
        break;

      case 'gitignore':
        // Detect package managers to include appropriate ignore patterns
        context.packageManagers = await detectPackageManagers(client, owner, repo);
        break;

      case 'pre_commit_hooks':
        // Detect package managers for appropriate hooks
        context.packageManagers = await detectPackageManagers(client, owner, repo);
        break;

      case 'testing_framework':
        // No additional context needed beyond README
        break;

      case 'linting':
        // No additional context needed beyond README
        break;
    }
  } catch (error) {
    console.error('Error fetching repo context:', error);
  }

  return context;
}

/**
 * Extract badge markdown from README
 */
function extractBadges(readme: string): string[] {
  const badgeRegex = /\[!\[.*?\]\(.*?\)\]\(.*?\)/g;
  return readme.match(badgeRegex) || [];
}

/**
 * Extract build steps from README
 */
function extractBuildSteps(readme: string): string {
  // Look for sections like "Installation", "Getting Started", "Setup"
  const sections = ['installation', 'getting started', 'setup', 'building', 'development'];
  const lines = readme.toLowerCase().split('\n');
  
  let capturing = false;
  const steps: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we hit a relevant section
    if (sections.some(s => line.includes(`## ${s}`) || line.includes(`### ${s}`))) {
      capturing = true;
      continue;
    }
    
    // Stop at next section
    if (capturing && (line.startsWith('## ') || line.startsWith('### '))) {
      break;
    }
    
    if (capturing) {
      steps.push(lines[i]); // Use original case
    }
  }
  
  return steps.join('\n');
}

/**
 * Extract environment variable mentions from README
 */
function extractEnvVarMentions(readme: string): string[] {
  // Look for common env var patterns: UPPER_CASE, process.env.VAR, $VAR
  const envVarRegex = /\b[A-Z][A-Z0-9_]+\b|process\.env\.([A-Z_]+)|\$([A-Z_]+)/g;
  const matches = readme.match(envVarRegex) || [];
  
  // Clean up and deduplicate
  const vars = new Set<string>();
  matches.forEach(match => {
    const cleaned = match.replace('process.env.', '').replace('$', '');
    if (cleaned.length > 1 && /^[A-Z]/.test(cleaned)) {
      vars.add(cleaned);
    }
  });
  
  return Array.from(vars);
}

/**
 * Detect package managers from repo files
 */
async function detectPackageManagers(
  client: GitHubClient,
  owner: string,
  repo: string
): Promise<string[]> {
  const managers: string[] = [];
  
  const checks = [
    { file: 'package.json', manager: 'npm' },
    { file: 'yarn.lock', manager: 'yarn' },
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'requirements.txt', manager: 'pip' },
    // Pipfile indicates pipenv usage (intentional mapping)
    { file: 'Pipfile', manager: 'pipenv' },
    { file: 'poetry.lock', manager: 'poetry' },
    { file: 'pyproject.toml', manager: 'pip' },  // Can be used with pip or poetry
    { file: 'go.mod', manager: 'gomod' },
    { file: 'Cargo.toml', manager: 'cargo' },
    { file: 'composer.json', manager: 'composer' },
    { file: 'Gemfile', manager: 'bundler' },
    { file: 'pom.xml', manager: 'maven' },
    { file: 'build.gradle', manager: 'gradle' },
  ];
  
  for (const { file, manager } of checks) {
    try {
      await client.getFileContent(repo, file);
      if (!managers.includes(manager)) {
        managers.push(manager);
      }
    } catch (_err) {
      // File doesn't exist
    }
  }
  
  console.log(`[detectPackageManagers] Detected package managers: ${managers.join(', ') || 'none'}`);
  return managers;
}

/**
 * Build enriched context by combining fetched data
 */
export async function enrichContext(
  baseContext: PromptChainContext,
  githubToken?: string
): Promise<EnrichedContext> {
  const fetchedContext = await fetchRepoContext(
    baseContext.repoOwner,
    baseContext.repoName,
    baseContext.practiceType,
    githubToken
  );
  
  return {
    ...baseContext,
    ...fetchedContext,
  };
}

/**
 * Build practice-specific prompt with context injection
 */
export function buildPracticePrompt(context: EnrichedContext): string {
  switch (context.practiceType) {
    case 'deploy_badge':
      return buildDeployBadgePrompt(context);
    case 'env_template':
      return buildEnvTemplatePrompt(context);
    case 'docker':
      return buildDockerPrompt(context);
    case 'dependabot':
      return buildDependabotPrompt(context);
    case 'ci_cd':
      return buildCICDPrompt(context);
    case 'gitignore':
      return buildGitignorePrompt(context);
    case 'pre_commit_hooks':
      return buildPreCommitHooksPrompt(context);
    case 'testing_framework':
      return buildTestingFrameworkPrompt(context);
    case 'linting':
      return buildLintingPrompt(context);
  }
}

function buildDeployBadgePrompt(context: EnrichedContext): string {
  const hasReadme = context.readme && context.readme.trim().length > 0;
  
  if (!hasReadme) {
    return `You are creating a README.md with a deployment status badge.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

TEMPLATE SNIPPET:
${context.template}

TASK: Create a basic README.md that includes:
- Project title (# ${context.repoName})
- Brief description placeholder
- Deployment status badge: [![Deploy Status](https://img.shields.io/badge/Deploy-Status-blue?style=for-the-badge)](DEPLOYMENT_URL_HERE)
- Installation section placeholder
- Usage section placeholder
- The user will replace DEPLOYMENT_URL_HERE with their actual deployment URL
- Return ONLY the README.md content, no explanations`;
  }
  
  return `You are updating a README.md to add a deployment status badge.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.badges && context.badges.length > 0 ? `EXISTING BADGES:\n${context.badges.join('\n')}` : 'No existing badges found.'}

CURRENT README:
${context.readme}

TEMPLATE SNIPPET:
${context.template}

TASK: Insert a deployment status badge near other badges or at the top of the README.
- Preserve existing formatting and style
- Place it logically with other status badges (if any exist)
- Use platform-agnostic placeholder: [![Deploy Status](https://img.shields.io/badge/Deploy-Status-blue?style=for-the-badge)](DEPLOYMENT_URL_HERE)
- The user will replace DEPLOYMENT_URL_HERE with their actual deployment URL (works with Netlify, Vercel, Railway, Render, Fly.io, Heroku, etc.)
- Return ONLY the modified README content, no explanations`;
}

function buildEnvTemplatePrompt(context: EnrichedContext): string {
  return `You are creating a .env.example file for environment variable documentation.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.envVars && context.envVars.length > 0 ? `ENV VARS MENTIONED IN README:\n${context.envVars.join(', ')}` : 'No env vars found in README.'}

${context.existingFiles?.['.env'] ? `EXISTING .env FILE:\n${context.existingFiles['.env']}` : 'No existing .env file.'}

TEMPLATE:
${context.template}

TASK: Create a comprehensive .env.example that:
- Includes all discovered variables with placeholder values
- Adds helpful comments explaining each variable
- Groups related vars logically
- Follows ${context.language || 'standard'} conventions
- Uses placeholder values (never real secrets)
- Return ONLY the .env.example file content`;
}

function buildDockerPrompt(context: EnrichedContext): string {
    // Tailor suggestions based on detected platform badges
    const badges = context.badges || [];
    const hasNetlify = badges.some(b => /api\.netlify\.com\/api\/v1\/badges\//i.test(b));
    const hasVercel = badges.some(b => /img\.shields\.io\/badge\/Deployed%20on-Vercel/i.test(b) || /vercel\.com\/(?:button|deploy)/i.test(b));
    const hasGHActions = badges.some(b => /github\.com\/.+?\/actions\/workflows\/.+?\.yml\/badge\.svg/i.test(b));

    const netlifySnippet = `[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)`;
    const vercelSnippet = `[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/YOUR-PROJECT)`;
    const ghaDeploySnippet = `[![Deploy Status](https://github.com/OWNER/REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/deploy.yml)`;

    const platformAdvice = hasNetlify
  ? `Detected Netlify usage. Prefer the official Netlify deploy status badge:
${netlifySnippet}
Replace YOUR-SITE-ID and YOUR-SITE-NAME accordingly.`
  : hasVercel
  ? `Detected Vercel usage. Prefer a clear deployed-on badge:
${vercelSnippet}
Link to your Vercel project/dashboard.`
  : hasGHActions
  ? `Detected GitHub Actions. If you have a deploy workflow, expose its badge:
${ghaDeploySnippet}
Replace OWNER/REPO and ensure workflow file is deploy.yml.`
  : `No platform detected. Use a platform-agnostic badge and link it to your deploy dashboard:
[![Deploy Status](https://img.shields.io/badge/Deploy-Status-blue?style=for-the-badge)](DEPLOYMENT_URL_HERE)`;

    return `You are updating a README.md to add or improve a deployment status badge.

Constraints:
- Keep existing badges intact and grouped at the top
- Use concise alt text ("Deploy Status" or platform name)
- Ensure the badge links to a real deployment dashboard

Context badges:
${badges.length ? badges.join('\n') : 'No existing badges found.'}

Recommended snippet:
${platformAdvice}

Placement:
- Place immediately under the project title, near CI badges for visibility
`;
}

function buildDependabotPrompt(context: EnrichedContext): string {
}

return `You are creating a Dependabot configuration for dependency updates.
REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers detected: ${context.packageManagers?.join(', ') || 'None detected'}

${context.contributing ? `UPDATE PREFERENCES FROM CONTRIBUTING:\n${context.contributing.slice(0, 300)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate .github/dependabot.yml that:
- Configures all detected package managers: ${context.packageManagers?.join(', ') || 'npm (default)'}
- Sets appropriate update intervals (weekly is good default)
- Each package-ecosystem + directory combination must be UNIQUE (no duplicates)
- Security updates are automatic - do NOT create separate entries for security
- Increase open-pull-requests-limit to handle both regular and security updates
- Uses sensible defaults
- Return ONLY the dependabot.yml file content`;
}

function buildCICDPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';
  
  return `You are creating a CI/CD workflow for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers: ${context.packageManagers?.join(', ') || 'Unknown'}

${context.buildSteps ? `BUILD INSTRUCTIONS FROM README:\n${context.buildSteps}` : 'No build instructions found in README.'}

${context.contributing ? `DEVELOPMENT GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate .github/workflows/ci.yml that:
${isPython ? `- Uses actions/setup-python@v4 with Python 3.10+
- Optionally tests on multiple Python versions (matrix strategy)
- Installs dependencies from requirements.txt or pyproject.toml
- Runs linting (flake8, ruff, or pylint)
- Runs tests with pytest and coverage
- Optionally uploads coverage to Codecov
- Triggers on push/PR to main branch` : ''}
${isJS ? `- Uses actions/setup-node@v4 with Node 18+
- Optionally tests on multiple Node versions
- Uses npm ci / yarn / pnpm for dependency install
- Runs type checking if TypeScript
- Runs linting (ESLint)
- Runs tests with coverage
- Triggers on push/PR to main branch` : ''}
- Has clear job names and steps
- Follows modern GitHub Actions best practices (v4 actions)
- Includes appropriate caching for dependencies
- Return ONLY the workflow YAML file content`;
}

function buildGitignorePrompt(context: EnrichedContext): string {
  return `You are creating a .gitignore file for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers: ${context.packageManagers?.join(', ') || 'Unknown'}

${context.readme ? `README CONTEXT:\n${context.readme.slice(0, 500)}...` : 'No README available.'}

TEMPLATE:
${context.template}

TASK: Generate .gitignore that:
- Includes patterns for ${context.language || 'common development'}
- Covers IDE files (.vscode, .idea, etc.)
- Ignores dependency directories (node_modules, venv, etc.)
- Includes OS-specific files (.DS_Store, Thumbs.db)
- Ignores build artifacts
- Ignores environment files (.env, .env.local)
- Well-organized with comments
- Return ONLY the .gitignore file content`;
}

function buildPreCommitHooksPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';
  
  return `You are creating pre-commit hooks configuration for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers: ${context.packageManagers?.join(', ') || 'Unknown'}

${context.contributing ? `DEVELOPMENT GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate .pre-commit-config.yaml that:
${isPython ? `- Uses Python-specific hooks:
  * black (code formatting)
  * isort (import sorting)
  * flake8 or ruff (linting)
  * mypy (type checking, optional)
- Includes pre-commit-hooks repo for general checks
- Uses stable versions (black 24.x, isort 5.x, flake8 7.x)
- Sets language_version: python3` : ''}
${isJS ? `- Uses JavaScript/TypeScript hooks:
  * prettier (formatting)
  * eslint (linting)
  * type checking if TypeScript
- Can use husky + lint-staged as alternative
- Uses stable versions` : ''}
- Includes trailing whitespace/line ending checks
- Includes YAML validation and large file checks
- Includes security checks (detect-private-key, check-merge-conflict)
- Follows pre-commit.com best practices
- Return ONLY the .pre-commit-config.yaml file content`;
}

function buildTestingFrameworkPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';
  
  return `You are setting up a testing framework for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.buildSteps ? `BUILD/DEVELOPMENT INFO:\n${context.buildSteps}` : 'No build information found.'}

${context.contributing ? `DEVELOPMENT GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate testing configuration that:
${isPython ? `- Uses pytest (industry standard for Python)
- Creates pytest.ini with:
  * Test discovery patterns (test_*.py, *_test.py)
  * Coverage configuration (pytest-cov)
  * Test markers (slow, integration, unit)
  * Minimum coverage threshold (80%)
- Set testpaths = tests
- Configure coverage report with term-missing` : ''}
${isJS ? `- Uses modern framework (Vitest for Vite projects, Jest for others)
- Includes TypeScript support if applicable
- Configures test environment (node, jsdom, happy-dom)
- Enables globals for cleaner test syntax
- Sets up coverage reporting` : ''}
- Includes basic configuration
- Sets up test directory structure expectations
- Configures coverage reporting
- Follows modern testing best practices
- Return ONLY the test configuration file content (pytest.ini for Python, vitest.config.ts/jest.config.js for JS/TS)`;
}

function buildLintingPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';
  
  return `You are setting up linting for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.contributing ? `CODE STYLE GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate linting configuration that:
${isPython ? `- Uses modern Python linting tools in pyproject.toml:
  * [tool.ruff] - Fast linter and formatter (recommended)
    - line-length = 120
    - select = ["E", "F", "I", "B", "UP", "C4"]
  * [tool.black] - Code formatter
    - line-length = 120
  * [tool.isort] - Import sorting
    - profile = "black"
- Alternative: .flake8 config if project uses flake8
- Exclude: .venv, venv, __pycache__, dist, build` : ''}
${isJS ? `- Uses ESLint with modern flat config (eslint.config.mjs)
- Includes TypeScript support if applicable
- Integrates Prettier for formatting
- Enables recommended rules
- Ignores: node_modules, dist, build, .next` : ''}
- Uses sensible defaults
- Enables recommended rules for the language
- Configures code style and formatting
- Ignores common directories appropriately
- Follows modern linting best practices
- Return ONLY the linting configuration file content (pyproject.toml/.flake8 for Python, eslint.config.mjs for JS/TS)`;
}
