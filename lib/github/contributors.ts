import type { Octokit } from '@octokit/rest';
import logger from '@/lib/log';

export async function getContributorStats(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ contributorCount: number; commitFrequency: number; busFactor: number }> {
  try {
    const { data: contributors } = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 100,
    });

    const contributorCount = contributors.length;
    const totalCommits = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0);

    let cumulativeCommits = 0;
    let busFactor = 0;
    for (const contributor of contributors) {
      cumulativeCommits += contributor.contributions || 0;
      busFactor++;
      if (cumulativeCommits >= totalCommits * 0.8) break;
    }

    const { data: commitActivity } = await octokit.repos.getCommitActivityStats({ owner, repo });
    const recentWeeks = commitActivity?.slice(-12) || [];
    const commitFrequency =
      recentWeeks.length > 0
        ? recentWeeks.reduce((sum, week) => sum + (week.total || 0), 0) / recentWeeks.length
        : 0;

    return {
      contributorCount,
      commitFrequency: Math.round(commitFrequency * 10) / 10,
      busFactor,
    };
  } catch (error) {
    logger.warn(`[GitHub] Failed to fetch contributor stats for ${owner}/${repo}:`, error);
    return { contributorCount: 0, commitFrequency: 0, busFactor: 0 };
  }
}
