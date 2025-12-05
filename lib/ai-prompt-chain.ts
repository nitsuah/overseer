/**
 * AI Prompt Chain Builder for Context-Aware Best Practice Fixes
 * Implements multi-stage RAG: Retrieval → Augmentation → Generation
 */

import { GitHubClient } from './github';

export type BestPracticeType = 'deploy_badge' | 'env_template' | 'docker' | 'dependabot';

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

  try {
    // Always fetch README (primary context source)
    try {
      const readmeContent = await client.getFileContent(owner, repo, 'README.md');
      if (readmeContent) {
        context.readme = readmeContent;
      
      // Extract badges from README for deploy_badge
      if (practiceType === 'deploy_badge') {
        context.badges = extractBadges(readmeContent);
      }
      
      // Extract build steps for docker
      if (practiceType === 'docker') {
        context.buildSteps = extractBuildSteps(readmeContent);
      }
      
      // Extract env var mentions for env_template
      if (practiceType === 'env_template') {
        context.envVars = extractEnvVarMentions(readmeContent);
      }
      }
    } catch (_) {
      console.log('No README found, continuing without it');
    }

    // Fetch CONTRIBUTING.md if available
    try {
      const contributingContent = await client.getFileContent(owner, repo, 'CONTRIBUTING.md');
      if (contributingContent) {
        context.contributing = contributingContent;
      }
    } catch (_) {
      console.log('No CONTRIBUTING.md found');
    }

    // Practice-specific file fetching
    switch (practiceType) {
      case 'env_template':
        // Try to fetch existing .env files
        const envFiles = ['.env', '.env.local', '.env.example'];
        context.existingFiles = {};
        for (const file of envFiles) {
          try {
            const content = await client.getFileContent(owner, repo, file);
            if (content) {
              context.existingFiles[file] = content;
            }
          } catch (_) {
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
            const content = await client.getFileContent(owner, repo, file);
            if (content) {
              context.existingFiles[file] = content;
            }
          } catch (_) {
            // File doesn't exist
          }
        }
        break;

      case 'dependabot':
        // Detect package managers from repo files
        context.packageManagers = await detectPackageManagers(client, owner, repo);
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
    { file: 'requirements.txt', manager: 'pip' },
    { file: 'Pipfile', manager: 'pip' },
    { file: 'go.mod', manager: 'gomod' },
    { file: 'Cargo.toml', manager: 'cargo' },
    { file: 'composer.json', manager: 'composer' },
    { file: 'Gemfile', manager: 'bundler' },
    { file: 'pom.xml', manager: 'maven' },
    { file: 'build.gradle', manager: 'gradle' },
  ];
  
  for (const { file, manager } of checks) {
    try {
      await client.getFileContent(owner, repo, file);
      managers.push(manager);
    } catch (_) {
      // File doesn't exist
    }
  }
  
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
  }
}

function buildDeployBadgePrompt(context: EnrichedContext): string {
  return `You are updating a README.md to add a deployment status badge.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.badges && context.badges.length > 0 ? `EXISTING BADGES:\n${context.badges.join('\n')}` : 'No existing badges found.'}

CURRENT README:
${context.readme || 'No README found.'}

TEMPLATE SNIPPET:
${context.template}

TASK: Insert the Netlify badge near other badges or at the top of the README.
- Preserve existing formatting and style
- Place it logically with other status badges (if any exist)
- Use placeholder: [![Netlify Status](https://api.netlify.com/api/v1/badges/SITE_ID_HERE/deploy-status)](https://app.netlify.com/sites/SITE_NAME_HERE/deploys)
- The user will replace SITE_ID_HERE and SITE_NAME_HERE with their actual Netlify site details
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
  return `You are creating Docker configuration for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.buildSteps ? `BUILD INSTRUCTIONS FROM README:\n${context.buildSteps}` : 'No build instructions found in README.'}

${context.contributing ? `CONTRIBUTING GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

${context.existingFiles?.['Dockerfile'] ? 'Note: A Dockerfile already exists. Improve it.' : ''}

TEMPLATES:
${context.template}

TASK: Generate Docker files that:
- Use appropriate base image for ${context.language || 'the project'}
- Match project's build/run process from README
- Include necessary dependencies
- Follow best practices
- Add helpful comments
- Return ONLY the Dockerfile content (or docker-compose.yml if needed)`;
}

function buildDependabotPrompt(context: EnrichedContext): string {
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
- Includes security updates
- Uses sensible defaults
- Return ONLY the dependabot.yml file content`;
}
