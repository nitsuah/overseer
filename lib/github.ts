import { Octokit } from '@octokit/rest';
import { createOctokitClient } from '@/lib/githubClient';

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  url: string;
  homepage: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  isFork: boolean;
}

export interface BranchInfo {
  name: string;
  protected: boolean;
}

export interface PullRequestInfo {
  number: number;
  title: string;
  state: 'open' | 'closed';
  draft: boolean;
  createdAt: string;
  updatedAt: string;
  user: string;
  labels: string[];
}

export class GitHubClient {
  private octokit: Octokit;
  private owner: string;
  private token: string;

  constructor(token: string, owner: string) {
    // Use shared Octokit instance factory
    this.octokit = createOctokitClient(token);
    this.owner = owner;
    this.token = token;
  }
  
    public getOctokit(): Octokit {
      return this.octokit;
    }

  async listRepos(): Promise<RepoMetadata[]> {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return data.map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      defaultBranch: repo.default_branch,
      url: repo.html_url,
      homepage: repo.homepage,
      topics: repo.topics || [],
      createdAt: repo.created_at || new Date().toISOString(),
      updatedAt: repo.updated_at || new Date().toISOString(),
      pushedAt: repo.pushed_at || new Date().toISOString(),
      isFork: repo.fork || false,
    }));
  }

  async getRepo(owner: string, repo: string): Promise<RepoMetadata> {
    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    });

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      url: data.html_url,
      homepage: data.homepage,
      topics: data.topics || [],
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
      pushedAt: data.pushed_at || new Date().toISOString(),
      isFork: data.fork || false,
    };
  }

  async getFileContent(repo: string, path: string, owner?: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: owner || this.owner,
        repo,
        path,
      });

      if ('content' in data && data.type === 'file') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getBranches(repo: string, owner?: string): Promise<BranchInfo[]> {
    const { data } = await this.octokit.repos.listBranches({
      owner: owner || this.owner,
      repo,
      per_page: 100,
    });

    return data.map((branch) => ({
      name: branch.name,
      protected: branch.protected,
    }));
  }

  async getPullRequests(repo: string, owner?: string): Promise<PullRequestInfo[]> {
    const { data } = await this.octokit.pulls.list({
      owner: owner || this.owner,
      repo,
      state: 'open',
      per_page: 100,
    });

    return data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state as 'open' | 'closed',
      draft: pr.draft || false,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      user: pr.user?.login || 'unknown',
      labels: pr.labels.map((label) => (typeof label === 'string' ? label : label.name || '')),
    }));
  }

  async createPrForFile(
    repo: string,
    branchName: string,
    filePath: string,
    content: string,
    message: string,
    owner?: string
  ): Promise<string> {
    const repoOwner = owner || this.owner;
    // 1. Get default branch SHA
    const { data: repoData } = await this.octokit.repos.get({
      owner: repoOwner,
      repo,
    });
    const defaultBranch = repoData.default_branch;

    const { data: refData } = await this.octokit.git.getRef({
      owner: repoOwner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const sha = refData.object.sha;

    // 2. Create new branch
    await this.octokit.git.createRef({
      owner: repoOwner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });

    // 3. Create/Update file
    await this.octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo,
      path: filePath,
      message,
      content: Buffer.from(content).toString('base64'),
      branch: branchName,
    });

    // 4. Create PR
    const { data: prData } = await this.octokit.pulls.create({
      owner: repoOwner,
      repo,
      title: message,
      head: branchName,
      base: defaultBranch,
      body: `Automated PR to add ${filePath}`,
    });

    return prData.html_url;
  }

  async createPrForFiles(
    repo: string,
    branchName: string,
    files: Array<{ path: string; content: string }>,
    message: string,
    owner?: string
  ): Promise<string> {
    const repoOwner = owner || this.owner;
    
    // Check if repo is accessible and not archived
    try {
      const { data: repoData } = await this.octokit.repos.get({
        owner: repoOwner,
        repo,
      });
      console.log('[createPrForFiles] Repo status:', {
        archived: repoData.archived,
        disabled: repoData.disabled,
        permissions: repoData.permissions,
      });
      
      if (repoData.archived) {
        throw new Error(`Repository ${repoOwner}/${repo} is archived and cannot accept changes`);
      }
    } catch (error: unknown) {
      console.error('[createPrForFiles] Failed to get repo info:', error);
      throw error;
    }
    
    // 1. Get default branch SHA
    // Use repository's default branch, not hardcoded 'main'
    const defaultBranch = (await this.octokit.repos.get({ owner: repoOwner, repo })).data.default_branch;
    const { data: refData } = await this.octokit.git.getRef({
      owner: repoOwner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const sha = refData.object.sha;

    // 2. Create new branch from main
    const refToCreate = `refs/heads/${branchName}`;
    console.log('[createPrForFiles] Creating branch with ref:', refToCreate);
    try {
      const createResult = await this.octokit.git.createRef({
        owner: repoOwner,
        repo,
        ref: refToCreate,
        sha,
      });
      console.log('[createPrForFiles] Branch created successfully:', createResult.data.ref);
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      console.error('[createPrForFiles] Failed to create initial branch:', {
        error: err.message,
        status: err.status,
        branchName,
        ref: refToCreate,
        sha
      });
      throw error;
    }

    // Small delay to avoid ref propagation race conditions
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Write files to the new branch via Contents API
    console.log('[createPrForFiles] Writing files to branch via Contents API');
    for (const file of files) {
      const normalizedPath = file.path.replace(/^\/+/, '').replace(/\\/g, '/');
      // Check if file exists on the new branch to get its sha
      let existingSha: string | undefined = undefined;
      try {
        const { data: existing } = await this.octokit.repos.getContent({
          owner: repoOwner,
          repo,
          path: normalizedPath,
          ref: branchName,
        });
        if (!Array.isArray(existing) && (existing as { sha?: string }).sha) {
          existingSha = (existing as { sha: string }).sha;
          console.log('[createPrForFiles] Existing file found on branch:', normalizedPath, existingSha);
        }
      } catch (getErr: unknown) {
        const err = getErr as { status?: number };
        if (err.status !== 404) {
          console.warn('[createPrForFiles] getContent warning:', normalizedPath, getErr);
        } else {
          console.log('[createPrForFiles] File does not exist on branch, will create:', normalizedPath);
        }
      }

      // Create or update the file on the branch
      const commitMsgTitle = message.split('\n')[0] || 'chore: add file';
      const commitMessage = `${commitMsgTitle}: ${normalizedPath}`;
      const { data: writeResult } = await this.octokit.repos.createOrUpdateFileContents({
        owner: repoOwner,
        repo,
        path: normalizedPath,
        message: commitMessage,
        content: Buffer.from(file.content).toString('base64'),
        branch: branchName,
        sha: existingSha,
      });
      console.log('[createPrForFiles] Wrote file via contents API:', normalizedPath, 'commit:', writeResult.commit?.sha);
    }

    // 4. Create PR
    const messageParts = message.split('\n\n');
    const title = messageParts[0];
    const body = messageParts.length > 1 ? messageParts.slice(1).join('\n\n') : `Automated PR to add files:\n\n${files.map(f => `- ${f.path}`).join('\n')}`;
    
    const { data: prData } = await this.octokit.pulls.create({
      owner: repoOwner,
      repo,
      title: title,
      head: branchName,
      base: defaultBranch,
      body: body,
    });

    return prData.html_url;
  }

  async getFileLastModified(repo: string, path: string, owner?: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.listCommits({
        owner: owner || this.owner,
        repo,
        path,
        per_page: 1,
      });

      if (data.length > 0 && data[0].commit.committer?.date) {
        return data[0].commit.committer.date;
      }
      return null;
    } catch {
      // If file doesn't exist or other error, return null
      return null;
    }
  }

  async getRepoFileList(repo: string, owner?: string, path = ''): Promise<string[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: owner || this.owner,
        repo,
        path,
      });

      const files: string[] = [];

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'file') {
            files.push(item.path);
          } else if (item.type === 'dir') {
            // Recursively get files from subdirectories
            const subFiles = await this.getRepoFileList(repo, owner || this.owner, item.path);
            files.push(...subFiles);
          }
        }
      }

      return files;
    } catch {
      return [];
    }
  }

  async getLanguageStats(repo: string, owner?: string): Promise<Record<string, number>> {
    try {
      const { data } = await this.octokit.repos.listLanguages({
        owner: owner || this.owner,
        repo,
      });
      return data;
    } catch {
      return {};
    }
  }

  async getWorkflowRuns(repo: string, owner?: string): Promise<{ status: string; lastRun: string | null; workflowName: string | null }> {
    try {
      const { data } = await this.octokit.actions.listWorkflowRunsForRepo({
        owner: owner || this.owner,
        repo,
        per_page: 1,
        status: 'completed',
      });

      if (data.workflow_runs.length === 0) {
        return { status: 'unknown', lastRun: null, workflowName: null };
      }

      const latestRun = data.workflow_runs[0];
      const status = latestRun.conclusion === 'success' ? 'passing' : 'failing';

      return {
        status,
        lastRun: latestRun.updated_at || latestRun.created_at,
        workflowName: latestRun.name || null,
      };
    } catch {
      return { status: 'unknown', lastRun: null, workflowName: null };
    }
  }

  async getVulnerabilityAlerts(repo: string, owner?: string): Promise<{
    total: number;
    critical: number;
    high: number;
  }> {
    try {
      // Note: This requires special permissions (security_events scope)
      // If not available, returns zeros silently
      const { data } = await this.octokit.request('GET /repos/{owner}/{repo}/dependabot/alerts', {
        owner: owner || this.owner,
        repo,
        state: 'open',
        per_page: 100,
      });

      const alerts = data as Array<{ security_advisory?: { severity?: string } }>;

      const critical = alerts.filter(a => a.security_advisory?.severity === 'critical').length;
      const high = alerts.filter(a => a.security_advisory?.severity === 'high').length;

      return {
        total: alerts.length,
        critical,
        high,
      };
    } catch {
      // If API call fails (lack of permissions, etc.), return zeros
      return { total: 0, critical: 0, high: 0 };
    }
  }

  async getContributorStats(repo: string, owner?: string): Promise<{
    contributorCount: number;
    commitFrequency: number; // commits per week
    busFactor: number;
  }> {
    try {
      const { data: contributors } = await this.octokit.repos.listContributors({
        owner: owner || this.owner,
        repo,
        per_page: 100,
      });

      const contributorCount = contributors.length;

      // Calculate bus factor (80/20 rule: contributors making 80% of commits)
      const totalCommits = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
      let cumulativeCommits = 0;
      let busFactor = 0;

      for (const contributor of contributors) {
        cumulativeCommits += contributor.contributions || 0;
        busFactor++;
        if (cumulativeCommits >= totalCommits * 0.8) {
          break;
        }
      }

      // Get commit activity for last 52 weeks
      const { data: commitActivity } = await this.octokit.repos.getCommitActivityStats({
        owner: owner || this.owner,
        repo,
      });

      // Calculate average commits per week from last 12 weeks
      const recentWeeks = commitActivity?.slice(-12) || [];
      const commitFrequency = recentWeeks.length > 0
        ? recentWeeks.reduce((sum, week) => sum + (week.total || 0), 0) / recentWeeks.length
        : 0;

      return {
        contributorCount,
        commitFrequency: Math.round(commitFrequency * 10) / 10, // 1 decimal place
        busFactor,
      };
    } catch {
      return { contributorCount: 0, commitFrequency: 0, busFactor: 0 };
    }
  }

  async getPullRequestStats(repo: string, owner?: string): Promise<{
    avgMergeTimeHours: number;
  }> {
    try {
      const { data: prs } = await this.octokit.pulls.list({
        owner: owner || this.owner,
        repo,
        state: 'closed',
        per_page: 30,
        sort: 'updated',
        direction: 'desc',
      });

      const mergedPrs = prs.filter(pr => pr.merged_at);

      if (mergedPrs.length === 0) {
        return { avgMergeTimeHours: 0 };
      }

      const mergeTimes = mergedPrs.map(pr => {
        const created = new Date(pr.created_at).getTime();
        const merged = new Date(pr.merged_at!).getTime();
        return (merged - created) / (1000 * 60 * 60); // hours
      });

      const avgMergeTimeHours = mergeTimes.reduce((sum, time) => sum + time, 0) / mergeTimes.length;

      return {
        avgMergeTimeHours: Math.round(avgMergeTimeHours * 10) / 10, // 1 decimal place
      };
    } catch {
      return { avgMergeTimeHours: 0 };
    }
  }
}
