import { Octokit } from '@octokit/rest';

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

  constructor(token: string, owner: string) {
    this.octokit = new Octokit({ auth: token });
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
    let sha = refData.object.sha;

    // 2. Create new branch
    await this.octokit.git.createRef({
      owner: repoOwner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });

    // 3. Create/Update files
    for (const file of files) {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: repoOwner,
        repo,
        path: file.path,
        message: `docs: add ${file.path}`,
        content: Buffer.from(file.content).toString('base64'),
        branch: branchName,
      });
    }

    // 4. Create PR
    const { data: prData } = await this.octokit.pulls.create({
      owner: repoOwner,
      repo,
      title: message,
      head: branchName,
      base: defaultBranch,
      body: `Automated PR to add missing documentation:\n\n${files.map(f => `- ${f.path}`).join('\n')}`,
    });

    return prData.html_url;
  }
}
