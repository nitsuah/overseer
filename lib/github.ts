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
  public octokit: Octokit;
  private owner: string;

  constructor(token: string, owner: string) {
    // Use shared Octokit instance factory
    this.octokit = createOctokitClient(token);
    this.owner = owner;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.status === 404) {
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
    console.log('[createPrForFiles] Starting with:', { repo, repoOwner, branchName, fileCount: files.length });
    
    // 1. Get default branch SHA
    const { data: repoData } = await this.octokit.repos.get({
      owner: repoOwner,
      repo,
    });
    const defaultBranch = repoData.default_branch;
    console.log('[createPrForFiles] Got repo data, default branch:', defaultBranch);

    const { data: refData } = await this.octokit.git.getRef({
      owner: repoOwner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const sha = refData.object.sha;
    console.log('[createPrForFiles] Got ref SHA:', sha);

    // 2. Create new branch
    await this.octokit.git.createRef({
      owner: repoOwner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });
    console.log('[createPrForFiles] Created branch:', branchName);

    // 3. Create/Update files using Git Tree API for better nested directory support
    const { data: baseCommit } = await this.octokit.git.getCommit({
      owner: repoOwner,
      repo,
      commit_sha: sha,
    });
    console.log('[createPrForFiles] Got base commit, tree SHA:', baseCommit.tree.sha);

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const normalizedPath = file.path.replace(/^\/+/, '').replace(/\\/g, '/');
        console.log('[createPrForFiles] Creating blob for:', normalizedPath);
        const { data: blob } = await this.octokit.git.createBlob({
          owner: repoOwner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64',
        });
        console.log('[createPrForFiles] Blob created:', blob.sha);
        return { path: normalizedPath, sha: blob.sha };
      })
    );

    console.log('[createPrForFiles] All blobs created:', blobs.map(b => b.path));

    // Create tree with all files
    const treeItems = blobs.map(blob => ({
      path: blob.path,
      mode: '100644' as const,
      type: 'blob' as const,
      sha: blob.sha,
    }));
    console.log('[createPrForFiles] Creating tree with items:', treeItems);
    
    const { data: newTree } = await this.octokit.git.createTree({
      owner: repoOwner,
      repo,
      base_tree: baseCommit.tree.sha,
      tree: treeItems,
    });
    console.log('[createPrForFiles] Tree created:', newTree.sha);

    // Create commit
    const { data: newCommit } = await this.octokit.git.createCommit({
      owner: repoOwner,
      repo,
      message: message.split('\n')[0], // Use first line as commit message
      tree: newTree.sha,
      parents: [sha],
    });

    // Update branch reference
    await this.octokit.git.updateRef({
      owner: repoOwner,
      repo,
      ref: `heads/${branchName}`,
      sha: newCommit.sha,
    });

    // 4. Create PR
    const messageParts = message.split('\n\n');
    const title = messageParts[0]; // First line/paragraph as title
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
