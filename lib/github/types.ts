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
  archived: boolean;
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
