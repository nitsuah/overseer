import { GitHubClient } from '@/lib/github';
import logger from '@/lib/log';
import { extractBadges, extractBuildSteps, extractEnvVarMentions } from './extractors';
import type { BestPracticeType, PromptChainContext, EnrichedContext } from './types';

async function fetchExistingFiles(
  client: GitHubClient,
  repo: string,
  paths: string[]
): Promise<Record<string, string>> {
  const results = await Promise.all(
    paths.map(async (file) => {
      try {
        const content = await client.getFileContent(repo, file);
        return content ? ([file, content] as const) : null;
      } catch {
        return null;
      }
    })
  );
  return Object.fromEntries(results.filter((r): r is [string, string] => r !== null));
}

export async function detectPackageManagers(
  client: GitHubClient,
  owner: string,
  repo: string
): Promise<string[]> {
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

  const results = await Promise.all(
    checks.map(async ({ file, manager }) => {
      try {
        await client.getFileContent(repo, file, owner);
        return manager;
      } catch {
        return null;
      }
    })
  );
  const managers = [...new Set(results.filter((m): m is string => m !== null))];

  logger.debug('[detectPackageManagers] Detected managers', { managers });
  return managers;
}

export async function fetchRepoContext(
  owner: string,
  repo: string,
  practiceType: BestPracticeType,
  githubToken?: string
): Promise<Partial<EnrichedContext>> {
  const client = new GitHubClient(githubToken || '', owner);
  const context: Partial<EnrichedContext> = {};

  logger.debug('[fetchRepoContext] Starting', { owner, repo, practiceType });

  const [fileListResult, readmeResult, contributingResult] = await Promise.allSettled([
    client.getRepoFileList(repo),
    client.getFileContent(repo, 'README.md'),
    client.getFileContent(repo, 'CONTRIBUTING.md'),
  ]);

  context.fileList = fileListResult.status === 'fulfilled' ? fileListResult.value : [];

  if (readmeResult.status === 'fulfilled' && readmeResult.value) {
    const readmeContent = readmeResult.value;
    context.readme = readmeContent;
    if (practiceType === 'deploy_badge') context.badges = extractBadges(readmeContent);
    if (practiceType === 'docker') context.buildSteps = extractBuildSteps(readmeContent);
    if (practiceType === 'env_template') context.envVars = extractEnvVarMentions(readmeContent);
  }

  if (contributingResult.status === 'fulfilled' && contributingResult.value) {
    context.contributing = contributingResult.value;
  }

  switch (practiceType) {
    case 'env_template': {
      context.existingFiles = await fetchExistingFiles(client, repo, ['.env', '.env.local', '.env.example']);
      break;
    }

    case 'docker': {
      context.existingFiles = await fetchExistingFiles(client, repo, ['Dockerfile', 'docker-compose.yml', '.dockerignore']);
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
