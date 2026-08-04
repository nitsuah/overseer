import { Octokit } from '@octokit/rest';
import { createOctokitClient } from '@/lib/githubClient';
import { githubCache } from '@/lib/github-cache';

export { githubCache };
export type { RepoMetadata, BranchInfo, PullRequestInfo } from './github/types';

import * as Repos from './github/repos';
import * as PRs from './github/prs';
import * as Security from './github/security';
import * as Contributors from './github/contributors';

export class GitHubClient {
  private octokit: Octokit;
  private owner: string;

  constructor(token: string, owner: string) {
    this.octokit = createOctokitClient(token);
    this.owner = owner;
  }

  public getOctokit(): Octokit {
    return this.octokit;
  }

  async getRateLimit() {
    const { data } = await this.octokit.rateLimit.get();
    return {
      limit: data.resources.core.limit,
      remaining: data.resources.core.remaining,
      reset: data.resources.core.reset,
    };
  }

  // Repo operations
  listRepos(since?: string) {
    return Repos.listRepos(this.octokit, since);
  }

  getRepo(owner: string, repo: string) {
    return Repos.getRepo(this.octokit, owner, repo);
  }

  getFileContent(repo: string, path: string, owner?: string) {
    return Repos.getFileContent(this.octokit, owner || this.owner, repo, path);
  }

  getBranches(repo: string, owner?: string) {
    return Repos.getBranches(this.octokit, owner || this.owner, repo);
  }

  getFileLastModified(repo: string, path: string, owner?: string) {
    return Repos.getFileLastModified(this.octokit, owner || this.owner, repo, path);
  }

  getRepoFileList(repo: string, owner?: string, path = '') {
    return Repos.getRepoFileList(this.octokit, owner || this.owner, repo, path);
  }

  getLanguageStats(repo: string, owner?: string) {
    return Repos.getLanguageStats(this.octokit, owner || this.owner, repo);
  }

  getWorkflowRuns(repo: string, owner?: string) {
    return Repos.getWorkflowRuns(this.octokit, owner || this.owner, repo);
  }

  // PR operations
  getPullRequests(repo: string, owner?: string) {
    return PRs.getPullRequests(this.octokit, owner || this.owner, repo);
  }

  getPullRequestReadiness(repo: string, owner?: string) {
    return PRs.getPullRequestReadiness(this.octokit, owner || this.owner, repo);
  }

  getPullRequestStats(repo: string, owner?: string) {
    return PRs.getPullRequestStats(this.octokit, owner || this.owner, repo);
  }

  createPrForFile(
    repo: string,
    branchName: string,
    filePath: string,
    content: string,
    message: string,
    owner?: string
  ) {
    return PRs.createPrForFile(
      this.octokit,
      owner || this.owner,
      repo,
      branchName,
      filePath,
      content,
      message
    );
  }

  createPrForFiles(
    repo: string,
    branchName: string,
    files: Array<{ path: string; content: string }>,
    message: string,
    owner?: string
  ) {
    return PRs.createPrForFiles(
      this.octokit,
      owner || this.owner,
      repo,
      branchName,
      files,
      message
    );
  }

  // Security operations
  getVulnerabilityAlerts(repo: string, owner?: string) {
    return Security.getVulnerabilityAlerts(this.octokit, owner || this.owner, repo);
  }

  getSecurityConfig(repo: string, owner?: string) {
    return Security.getSecurityConfig(this.octokit, owner || this.owner, repo);
  }

  // Contributor operations
  getContributorStats(repo: string, owner?: string) {
    return Contributors.getContributorStats(this.octokit, owner || this.owner, repo);
  }
}
