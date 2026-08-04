import { GitHubClient } from '@/lib/github';
import { extractBadges, extractBuildSteps, extractEnvVarMentions } from './extractors';
import type { BestPracticeType, PromptChainContext, EnrichedContext } from './types';

export async function detectPackageManagers(
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
    { file: 'Pipfile', manager: 'pipenv' },
    { file: 'poetry.lock', manager: 'poetry' },
    { file: 'pyproject.toml', manager: 'pip' },
    { file: 'go.mod', manager: 'gomod' },
    { file: 'Cargo.toml', manager: 'cargo' },
    { file: 'composer.json', manager: 'composer' },
    { file: 'Gemfile', manager: 'bundler' },
    { file: 'pom.xml', manager: 'maven' },
    { file: 'build.gradle', manager: 'gradle' },
  ];

  for (const { file, manager } of checks) {
    try {
      await client.getFileContent(repo, file, owner);
      if (!managers.includes(manager)) managers.push(manager);
    } catch {
      // File doesn't exist
    }
  }

  console.log(`[detectPackageManagers] Detected: ${managers.join(', ') || 'none'}`);
  return managers;
}

export async function fetchRepoContext(
  owner: string,
  repo: string,
  practiceType: BestPracticeType,
  githubToken?: string
): Promise<Partial<EnrichedContext>> {
  const client = new GitHubClient(githubToken || '', owner);
  const context: Partial<EnrichedContext> = { owner };

  console.log(`[fetchRepoContext] Starting for ${owner}/${repo}, practice: ${practiceType}`);

  try {
    const fileList = await client.getRepoFileList(repo);
    context.fileList = fileList;
  } catch {
    context.fileList = [];
  }

  try {
    const readmeContent = await client.getFileContent(repo, 'README.md');
    if (readmeContent) {
      context.readme = readmeContent;
      if (practiceType === 'deploy_badge') context.badges = extractBadges(readmeContent);
      if (practiceType === 'docker') context.buildSteps = extractBuildSteps(readmeContent);
      if (practiceType === 'env_template') context.envVars = extractEnvVarMentions(readmeContent);
    }
  } catch {
    // No README
  }

  try {
    const contributingContent = await client.getFileContent(repo, 'CONTRIBUTING.md');
    if (contributingContent) context.contributing = contributingContent;
  } catch {
    // No CONTRIBUTING.md
  }

  switch (practiceType) {
    case 'env_template': {
      context.existingFiles = {};
      for (const file of ['.env', '.env.local', '.env.example']) {
        try {
          const content = await client.getFileContent(repo, file);
          if (content) context.existingFiles[file] = content;
        } catch {
          // File doesn't exist
        }
      }
      break;
    }

    case 'docker': {
      context.existingFiles = {};
      for (const file of ['Dockerfile', 'docker-compose.yml', '.dockerignore']) {
        try {
          const content = await client.getFileContent(repo, file);
          if (content) context.existingFiles[file] = content;
        } catch {
          // File doesn't exist
        }
      }
      break;
    }

    case 'dependabot':
    case 'ci_cd':
    case 'gitignore':
    case 'pre_commit_hooks':
      context.packageManagers = await detectPackageManagers(client, owner, repo);
      break;

    case 'testing_framework':
    case 'linting':
    case 'deploy_badge':
      break;
  }

  return context;
}

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
  return { ...baseContext, ...fetchedContext };
}
