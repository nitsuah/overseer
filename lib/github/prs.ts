import type { Octokit } from '@octokit/rest';
import { githubCache } from '@/lib/github-cache';
import logger from '@/lib/log';
import type { PullRequestInfo } from './types';

export async function getPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<PullRequestInfo[]> {
  const cacheKey = `prs:${owner}/${repo}`;
  const cached = githubCache.get(cacheKey);
  const headers: Record<string, string> = {};
  if (cached?.etag) headers['If-None-Match'] = cached.etag;

  try {
    const { data, headers: responseHeaders } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 100,
      headers,
    });
    const etag = responseHeaders.etag ? String(responseHeaders.etag) : undefined;
    const prs = data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state as 'open' | 'closed',
      draft: pr.draft || false,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      user: pr.user?.login || 'unknown',
      labels: pr.labels.map((label) => (typeof label === 'string' ? label : label.name || '')),
    }));
    if (etag) githubCache.set(cacheKey, prs, etag);
    return prs;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'status' in error &&
      (error as { status?: number }).status === 304 &&
      cached
    )
      return cached.data as PullRequestInfo[];
    throw error;
  }
}

export async function getPullRequestReadiness(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ readyCount: number; blockedCount: number }> {
  try {
    const result = await octokit.graphql<{
      repository: {
        pullRequests: {
          nodes: Array<{
            isDraft: boolean;
            reviewDecision: string | null;
            mergeable: string;
            commits: {
              nodes: Array<{
                commit: { statusCheckRollup: { state: string } | null };
              }>;
            };
          }>;
        } | null;
      } | null;
    }>(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(states: OPEN, first: 50) {
            nodes {
              isDraft
              reviewDecision
              mergeable
              commits(last: 1) {
                nodes {
                  commit {
                    statusCheckRollup { state }
                  }
                }
              }
            }
          }
        }
      }`,
      { owner, repo }
    );

    const nodes = result.repository?.pullRequests?.nodes || [];
    let readyCount = 0;
    let blockedCount = 0;

    for (const pr of nodes) {
      const ciState = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.state;
      const ciFailing = ciState === 'FAILURE' || ciState === 'ERROR';
      const changesRequested = pr.reviewDecision === 'CHANGES_REQUESTED';
      const hasConflicts = pr.mergeable === 'CONFLICTING';

      if (pr.isDraft || changesRequested || ciFailing || hasConflicts) {
        blockedCount++;
      } else {
        readyCount++;
      }
    }

    return { readyCount, blockedCount };
  } catch (error) {
    logger.warn(`[GitHub] Failed to fetch PR readiness for ${owner}/${repo}:`, error);
    return { readyCount: 0, blockedCount: 0 };
  }
}

export async function getPullRequestStats(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ avgMergeTimeHours: number }> {
  try {
    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      per_page: 30,
      sort: 'updated',
      direction: 'desc',
    });

    const mergedPrs = prs.filter((pr) => pr.merged_at);
    if (mergedPrs.length === 0) return { avgMergeTimeHours: 0 };

    const mergeTimes = mergedPrs.map((pr) => {
      const created = new Date(pr.created_at).getTime();
      const merged = new Date(pr.merged_at!).getTime();
      return (merged - created) / (1000 * 60 * 60);
    });

    const avg = mergeTimes.reduce((sum, t) => sum + t, 0) / mergeTimes.length;
    return { avgMergeTimeHours: Math.round(avg * 10) / 10 };
  } catch (error) {
    logger.warn(`[GitHub] Failed to fetch PR stats for ${owner}/${repo}:`, error);
    return { avgMergeTimeHours: 0 };
  }
}

export async function createPrForFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string,
  filePath: string,
  content: string,
  message: string
): Promise<string> {
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });
  const sha = refData.object.sha;

  try {
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha });
  } catch (error: unknown) {
    const err = error as { status?: number };
    if (err.status !== 422) throw error; // 422 = ref already exists, reuse it
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message,
    content: Buffer.from(content).toString('base64'),
    branch: branchName,
  });

  const { data: prData } = await octokit.pulls.create({
    owner,
    repo,
    title: message.split('\n')[0],
    head: branchName,
    base: defaultBranch,
    body: `Automated PR to add ${filePath}`,
  });

  return prData.html_url;
}

export async function createPrForFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string,
  files: Array<{ path: string; content: string }>,
  message: string
): Promise<string> {
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  logger.debug('[createPrForFiles] Repo status', {
    archived: repoData.archived,
    disabled: repoData.disabled,
    permissions: repoData.permissions,
  });

  if (repoData.archived) {
    throw new Error(`Repository ${owner}/${repo} is archived and cannot accept changes`);
  }

  const defaultBranch = repoData.default_branch;
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });
  const sha = refData.object.sha;

  const refToCreate = `refs/heads/${branchName}`;
  logger.debug('[createPrForFiles] Creating branch', { ref: refToCreate });
  try {
    const createResult = await octokit.git.createRef({ owner, repo, ref: refToCreate, sha });
    logger.debug('[createPrForFiles] Branch created', { ref: createResult.data.ref });
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    logger.error('[createPrForFiles] Failed to create branch', {
      error: err.message,
      status: err.status,
      branchName,
      ref: refToCreate,
      sha,
    });
    throw error;
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  logger.debug('[createPrForFiles] Writing files to branch via Contents API');
  for (const file of files) {
    const normalizedPath = file.path.replace(/^\/+/, '').replace(/\\/g, '/');
    let existingSha: string | undefined = undefined;
    try {
      const { data: existing } = await octokit.repos.getContent({
        owner,
        repo,
        path: normalizedPath,
        ref: branchName,
      });
      if (!Array.isArray(existing) && (existing as { sha?: string }).sha) {
        existingSha = (existing as { sha: string }).sha;
        logger.debug('[createPrForFiles] Existing file found on branch', { path: normalizedPath, sha: existingSha });
      }
    } catch (getErr: unknown) {
      const err = getErr as { status?: number };
      if (err.status !== 404) {
        logger.warn('[createPrForFiles] getContent warning', { path: normalizedPath, error: getErr });
      } else {
        logger.debug('[createPrForFiles] File does not exist on branch, will create', { path: normalizedPath });
      }
    }

    const commitMsgTitle = message.split('\n')[0] || 'chore: add file';
    const commitMessage = `${commitMsgTitle}: ${normalizedPath}`;
    const { data: writeResult } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: normalizedPath,
      message: commitMessage,
      content: Buffer.from(file.content).toString('base64'),
      branch: branchName,
      sha: existingSha,
    });
    logger.debug('[createPrForFiles] Wrote file', { path: normalizedPath, commit: writeResult.commit?.sha });
  }

  const messageParts = message.split('\n\n');
  const title = messageParts[0];
  const body =
    messageParts.length > 1
      ? messageParts.slice(1).join('\n\n')
      : `Automated PR to add files:\n\n${files.map((f) => `- ${f.path}`).join('\n')}`;

  const { data: prData } = await octokit.pulls.create({
    owner,
    repo,
    title,
    head: branchName,
    base: defaultBranch,
    body,
  });

  return prData.html_url;
}
