/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubClient } from './github';

// Mock Octokit
const mockListForAuthenticatedUser = vi.fn();
const mockGetRepo = vi.fn();
const mockGetContent = vi.fn();

const mockOctokitInstance = {
    repos: {
        listForAuthenticatedUser: mockListForAuthenticatedUser,
        get: mockGetRepo,
        getContent: mockGetContent,
    },
};

vi.mock('@octokit/rest', () => {
    const MockOctokit: any = vi.fn(function (this: any) {
        this.repos = {
            listForAuthenticatedUser: mockListForAuthenticatedUser,
            get: mockGetRepo,
            getContent: mockGetContent,
        };
    });
    MockOctokit.plugin = vi.fn(() => MockOctokit);
    return {
        Octokit: MockOctokit,
    };
});

vi.mock('@octokit/plugin-throttling', () => ({
    throttling: {},
}));

vi.mock('@octokit/plugin-retry', () => ({
    retry: {},
}));

vi.mock('@/lib/githubClient', () => ({
    createOctokitClient: vi.fn(() => mockOctokitInstance),
}));

describe('GitHubClient', () => {
    let client: GitHubClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new GitHubClient('fake-token', 'fake-owner');
    });

    it('should list repos', async () => {
        mockListForAuthenticatedUser.mockResolvedValue({
            data: [
                {
                    name: 'repo-1',
                    full_name: 'owner/repo-1',
                    description: 'desc',
                    language: 'TypeScript',
                    stargazers_count: 10,
                    forks_count: 2,
                    open_issues_count: 1,
                    default_branch: 'main',
                    html_url: 'http://github.com/owner/repo-1',
                    homepage: null,
                    topics: [],
                    created_at: '2023-01-01',
                    updated_at: '2023-01-02',
                    pushed_at: '2023-01-03',
                    fork: false,
                },
            ],
            headers: {},
        });

        const repos = await client.listRepos();
        expect(repos).toHaveLength(1);
        expect(repos[0].name).toBe('repo-1');
        expect(mockListForAuthenticatedUser).toHaveBeenCalled();
    });

    it('should get file content', async () => {
        mockGetContent.mockResolvedValue({
            data: {
                type: 'file',
                content: Buffer.from('hello world').toString('base64'),
            },
            headers: {},
        });

        const content = await client.getFileContent('repo-1', 'README.md');
        expect(content).toBe('hello world');
        expect(mockGetContent).toHaveBeenCalledWith({
            owner: 'fake-owner',
            repo: 'repo-1',
            path: 'README.md',
            headers: {},
        });
    });

    it('should return null if file not found', async () => {
        mockGetContent.mockRejectedValue({ status: 404 });
        const content = await client.getFileContent('repo-1', 'MISSING.md');
        expect(content).toBeNull();
    });
});
