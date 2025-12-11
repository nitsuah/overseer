import { test, expect, vi } from 'vitest';
import { GitHubClient } from '../lib/github';
import type { Octokit } from '@octokit/rest';

// Mock the Octokit client factory
vi.mock('@/lib/githubClient', () => ({
  createOctokitClient: vi.fn((token: string) => ({
    repos: {
      listForAuthenticatedUser: vi.fn(),
      get: vi.fn(),
      getContent: vi.fn(),
      listBranches: vi.fn(),
      createOrUpdateFileContents: vi.fn(),
    },
    pulls: {
      list: vi.fn(),
      create: vi.fn(),
    },
    git: {
      getRef: vi.fn(),
      createRef: vi.fn(),
    },
  })),
}));

test('GitHubClient.listRepos returns mapped repo metadata', async () => {
  const client = new GitHubClient('fake-token', 'test-owner');
  const mockOctokit = client.getOctokit() as unknown as {
    repos: { listForAuthenticatedUser: ReturnType<typeof vi.fn> };
  };

  mockOctokit.repos.listForAuthenticatedUser.mockResolvedValue({
    data: [
      {
        name: 'test-repo',
        full_name: 'test-owner/test-repo',
        description: 'Test description',
        language: 'TypeScript',
        stargazers_count: 10,
        forks_count: 2,
        open_issues_count: 3,
        default_branch: 'main',
        html_url: 'https://github.com/test-owner/test-repo',
        homepage: 'https://example.com',
        topics: ['test', 'repo'],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-06-01T00:00:00Z',
        pushed_at: '2023-06-15T00:00:00Z',
        fork: false,
      },
    ],
  });

  const repos = await client.listRepos();
  expect(repos).toHaveLength(1);
  expect(repos[0].name).toBe('test-repo');
  expect(repos[0].stars).toBe(10);
  expect(repos[0].language).toBe('TypeScript');
  expect(repos[0].isFork).toBe(false);
});

test('GitHubClient.getRepo returns single repo metadata', async () => {
  const client = new GitHubClient('fake-token', 'test-owner');
  const mockOctokit = client.getOctokit() as unknown as {
    repos: { get: ReturnType<typeof vi.fn> };
  };

  mockOctokit.repos.get.mockResolvedValue({
    data: {
      name: 'single-repo',
      full_name: 'owner/single-repo',
      description: 'Single repo',
      language: 'JavaScript',
      stargazers_count: 5,
      forks_count: 1,
      open_issues_count: 0,
      default_branch: 'main',
      html_url: 'https://github.com/owner/single-repo',
      homepage: null,
      topics: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      pushed_at: '2024-06-01T00:00:00Z',
      fork: false,
    },
  });

  const repo = await client.getRepo('owner', 'single-repo');
  expect(repo.name).toBe('single-repo');
  expect(repo.stars).toBe(5);
  expect(repo.topics).toEqual([]);
});

test('GitHubClient.getFileContent returns decoded content', async () => {
  const client = new GitHubClient('fake-token', 'test-owner');
  const mockOctokit = client.getOctokit() as unknown as {
    repos: { getContent: ReturnType<typeof vi.fn> };
  };

  const content = 'Hello World';
  const encoded = Buffer.from(content).toString('base64');

  mockOctokit.repos.getContent.mockResolvedValue({
    data: {
      type: 'file',
      content: encoded,
      encoding: 'base64',
    },
  });

  const result = await client.getFileContent('test-repo', 'README.md');
  expect(result).toBe(content);
});

test('GitHubClient.getFileContent returns null for 404', async () => {
  const client = new GitHubClient('fake-token', 'test-owner');
  const mockOctokit = client.getOctokit() as unknown as {
    repos: { getContent: ReturnType<typeof vi.fn> };
  };

  mockOctokit.repos.getContent.mockRejectedValue({ status: 404 });

  const result = await client.getFileContent('test-repo', 'MISSING.md');
  expect(result).toBeNull();
});

test('GitHubClient.getBranches returns branch list', async () => {
  const client = new GitHubClient('fake-token', 'test-owner');
  const mockOctokit = client.getOctokit() as unknown as {
    repos: { listBranches: ReturnType<typeof vi.fn> };
  };

  mockOctokit.repos.listBranches.mockResolvedValue({
    data: [
      { name: 'main', protected: true },
      { name: 'develop', protected: false },
    ],
  });

  const branches = await client.getBranches('test-repo');
  expect(branches).toHaveLength(2);
  expect(branches[0].name).toBe('main');
  expect(branches[0].protected).toBe(true);
});

test('GitHubClient.getPullRequests returns PR list', async () => {
  const client = new GitHubClient('fake-token', 'test-owner');
  const mockOctokit = client.getOctokit() as unknown as {
    pulls: { list: ReturnType<typeof vi.fn> };
  };

  mockOctokit.pulls.list.mockResolvedValue({
    data: [
      {
        number: 1,
        title: 'Test PR',
        state: 'open',
        draft: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        user: { login: 'test-user' },
        labels: [{ name: 'bug' }, { name: 'priority' }],
      },
    ],
  });

  const prs = await client.getPullRequests('test-repo');
  expect(prs).toHaveLength(1);
  expect(prs[0].number).toBe(1);
  expect(prs[0].title).toBe('Test PR');
  expect(prs[0].labels).toEqual(['bug', 'priority']);
});
