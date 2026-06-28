/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubClient } from './github';
import { githubCache } from './github-cache';

// Mock Octokit methods used across GitHubClient methods
const mockListForAuthenticatedUser = vi.fn();
const mockGetRepo = vi.fn();
const mockGetContent = vi.fn();
const mockListBranches = vi.fn();
const mockListCommits = vi.fn();
const mockListLanguages = vi.fn();
const mockListContributors = vi.fn();
const mockGetCommitActivityStats = vi.fn();
const mockCreateOrUpdateFileContents = vi.fn();
const mockPullsList = vi.fn();
const mockPullsCreate = vi.fn();
const mockGitGetRef = vi.fn();
const mockGitCreateRef = vi.fn();
const mockActionsListWorkflowRunsForRepo = vi.fn();
const mockRequest = vi.fn();
const mockGraphql = vi.fn();

const mockOctokitInstance = {
    repos: {
        listForAuthenticatedUser: mockListForAuthenticatedUser,
        get: mockGetRepo,
        getContent: mockGetContent,
        listBranches: mockListBranches,
        listCommits: mockListCommits,
        listLanguages: mockListLanguages,
        listContributors: mockListContributors,
        getCommitActivityStats: mockGetCommitActivityStats,
        createOrUpdateFileContents: mockCreateOrUpdateFileContents,
    },
    pulls: {
        list: mockPullsList,
        create: mockPullsCreate,
    },
    git: {
        getRef: mockGitGetRef,
        createRef: mockGitCreateRef,
    },
    actions: {
        listWorkflowRunsForRepo: mockActionsListWorkflowRunsForRepo,
    },
    request: mockRequest,
    graphql: mockGraphql,
};

vi.mock('@octokit/rest', () => {
    const MockOctokit: any = vi.fn(function (this: any) {
        return mockOctokitInstance;
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
    const originalSetTimeout = global.setTimeout;

    beforeEach(() => {
        vi.clearAllMocks();
        githubCache.clear();
        githubCache.stopPruning();
        global.setTimeout = originalSetTimeout;
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

    it('should use cached repos when GitHub returns 304', async () => {
        mockListForAuthenticatedUser.mockResolvedValueOnce({
            data: [
                {
                    name: 'repo-cache',
                    full_name: 'owner/repo-cache',
                    description: null,
                    language: null,
                    stargazers_count: 0,
                    forks_count: 0,
                    open_issues_count: 0,
                    default_branch: 'main',
                    html_url: 'http://github.com/owner/repo-cache',
                    homepage: null,
                    topics: [],
                    created_at: '2023-01-01',
                    updated_at: '2023-01-01',
                    pushed_at: '2023-01-01',
                    fork: false,
                    archived: false,
                },
            ],
            headers: { etag: 'etag-repos' },
        });

        mockListForAuthenticatedUser.mockRejectedValueOnce({ status: 304 });

        const first = await client.listRepos();
        const second = await client.listRepos();

        expect(first[0].name).toBe('repo-cache');
        expect(second[0].name).toBe('repo-cache');
        expect(mockListForAuthenticatedUser).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                headers: { 'If-None-Match': 'etag-repos' },
            })
        );
    });

    it('should map repo metadata from getRepo', async () => {
        mockGetRepo.mockResolvedValue({
            data: {
                name: 'repo-a',
                full_name: 'fake-owner/repo-a',
                description: 'desc',
                language: 'TypeScript',
                stargazers_count: 5,
                forks_count: 1,
                open_issues_count: 2,
                default_branch: 'main',
                html_url: 'https://github.com/fake-owner/repo-a',
                homepage: 'https://example.com',
                topics: ['nextjs'],
                created_at: '2023-01-01',
                updated_at: '2023-01-02',
                pushed_at: '2023-01-03',
                fork: true,
                archived: true,
            },
        });

        const repo = await client.getRepo('fake-owner', 'repo-a');

        expect(repo.fullName).toBe('fake-owner/repo-a');
        expect(repo.isFork).toBe(true);
        expect(repo.archived).toBe(true);
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

    it('should use cached file content when GitHub returns 304', async () => {
        mockGetContent.mockResolvedValueOnce({
            data: {
                type: 'file',
                content: Buffer.from('cached content').toString('base64'),
            },
            headers: { etag: 'etag-file' },
        });
        mockGetContent.mockRejectedValueOnce({ status: 304 });

        const first = await client.getFileContent('repo-1', 'README.md');
        const second = await client.getFileContent('repo-1', 'README.md');

        expect(first).toBe('cached content');
        expect(second).toBe('cached content');
        expect(mockGetContent).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ headers: { 'If-None-Match': 'etag-file' } })
        );
    });

    it('should return null when content endpoint is not a file', async () => {
        mockGetContent.mockResolvedValue({
            data: { type: 'dir' },
            headers: {},
        });

        const content = await client.getFileContent('repo-1', 'docs');
        expect(content).toBeNull();
    });

    it('should throw non-404/non-304 errors from getFileContent', async () => {
        mockGetContent.mockRejectedValue(new Error('rate limited'));

        await expect(client.getFileContent('repo-1', 'README.md')).rejects.toThrow('rate limited');
    });

    it('should get branch info', async () => {
        mockListBranches.mockResolvedValue({
            data: [
                { name: 'main', protected: true },
                { name: 'dev', protected: false },
            ],
            headers: { etag: '"abc123"' },
            status: 200,
            url: '',
        });

        const branches = await client.getBranches('repo-1');
        expect(branches).toEqual([
            { name: 'main', protected: true },
            { name: 'dev', protected: false },
        ]);
    });

    it('should get pull requests', async () => {
        mockPullsList.mockResolvedValue({
            data: [
                {
                    number: 7,
                    title: 'Improve docs',
                    state: 'open',
                    draft: false,
                    created_at: '2024-01-01',
                    updated_at: '2024-01-02',
                    user: { login: 'alice' },
                    labels: ['docs', { name: 'enhancement' }],
                },
            ],
            headers: { etag: '"prs123"' },
            status: 200,
            url: '',
        });

        const prs = await client.getPullRequests('repo-1');
        expect(prs[0]).toEqual(
            expect.objectContaining({
                number: 7,
                user: 'alice',
                labels: ['docs', 'enhancement'],
            })
        );
    });

    it('should classify open PRs by review/CI readiness', async () => {
        mockGraphql.mockResolvedValue({
            repository: {
                pullRequests: {
                    nodes: [
                        // Ready: not draft, no changes requested, CI passing
                        {
                            isDraft: false,
                            reviewDecision: 'APPROVED',
                            mergeable: 'MERGEABLE',
                            commits: { nodes: [{ commit: { statusCheckRollup: { state: 'SUCCESS' } } }] },
                        },
                        // Blocked: draft
                        {
                            isDraft: true,
                            reviewDecision: null,
                            mergeable: 'MERGEABLE',
                            commits: { nodes: [] },
                        },
                        // Blocked: changes requested
                        {
                            isDraft: false,
                            reviewDecision: 'CHANGES_REQUESTED',
                            mergeable: 'MERGEABLE',
                            commits: { nodes: [{ commit: { statusCheckRollup: { state: 'SUCCESS' } } }] },
                        },
                        // Blocked: CI failing
                        {
                            isDraft: false,
                            reviewDecision: null,
                            mergeable: 'MERGEABLE',
                            commits: { nodes: [{ commit: { statusCheckRollup: { state: 'FAILURE' } } }] },
                        },
                        // Blocked: merge conflict
                        {
                            isDraft: false,
                            reviewDecision: null,
                            mergeable: 'CONFLICTING',
                            commits: { nodes: [{ commit: { statusCheckRollup: null } }] },
                        },
                    ],
                },
            },
        });

        const readiness = await client.getPullRequestReadiness('repo-1');
        expect(readiness).toEqual({ readyCount: 1, blockedCount: 4 });
    });

    it('should return zero counts when PR readiness query fails', async () => {
        mockGraphql.mockRejectedValue(new Error('GraphQL error'));

        const readiness = await client.getPullRequestReadiness('repo-1');
        expect(readiness).toEqual({ readyCount: 0, blockedCount: 0 });
    });

    it('should create PR for a single file', async () => {
        mockGetRepo.mockResolvedValue({ data: { default_branch: 'main' } });
        mockGitGetRef.mockResolvedValue({ data: { object: { sha: 'abc123' } } });
        mockGitCreateRef.mockResolvedValue({ data: { ref: 'refs/heads/feat/test' } });
        mockCreateOrUpdateFileContents.mockResolvedValue({ data: {} });
        mockPullsCreate.mockResolvedValue({ data: { html_url: 'https://github.com/pr/1' } });

        const prUrl = await client.createPrForFile('repo-1', 'feat/test', 'README.md', '# hi', 'docs: update');

        expect(prUrl).toBe('https://github.com/pr/1');
        expect(mockGitCreateRef).toHaveBeenCalledWith(
            expect.objectContaining({ ref: 'refs/heads/feat/test', sha: 'abc123' })
        );
        expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith(
            expect.objectContaining({ path: 'README.md', branch: 'feat/test' })
        );
    });

    it('should create PR for multiple files', async () => {
        vi.useFakeTimers();
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        mockGetRepo.mockResolvedValue({
            data: {
                default_branch: 'main',
                archived: false,
                disabled: false,
                permissions: { push: true },
            },
        });
        mockGitGetRef.mockResolvedValue({ data: { object: { sha: 'sha-main' } } });
        mockGitCreateRef.mockResolvedValue({ data: { ref: 'refs/heads/feat/multi' } });
        mockGetContent
            .mockRejectedValueOnce({ status: 404 })
            .mockResolvedValueOnce({ data: { sha: 'existing-sha' } });
        mockCreateOrUpdateFileContents
            .mockResolvedValueOnce({ data: { commit: { sha: 'c1' } } })
            .mockResolvedValueOnce({ data: { commit: { sha: 'c2' } } });
        mockPullsCreate.mockResolvedValue({ data: { html_url: 'https://github.com/pr/2' } });

        const prPromise = client.createPrForFiles(
            'repo-1',
            'feat/multi',
            [
                { path: '/new.txt', content: 'new file' },
                { path: 'existing.txt', content: 'updated file' },
            ],
            'chore: update files\n\nbody'
        );

        await vi.runAllTimersAsync();
        const prUrl = await prPromise;

        expect(prUrl).toBe('https://github.com/pr/2');
        expect(mockCreateOrUpdateFileContents).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ path: 'new.txt', sha: undefined })
        );
        expect(mockCreateOrUpdateFileContents).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ path: 'existing.txt', sha: 'existing-sha' })
        );

        logSpy.mockRestore();
        errorSpy.mockRestore();
        warnSpy.mockRestore();
        vi.useRealTimers();
    });

    it('should reject creating multi-file PR for archived repositories', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGetRepo.mockResolvedValue({ data: { archived: true, disabled: false, permissions: {} } });

        await expect(
            client.createPrForFiles('repo-1', 'feat/blocked', [{ path: 'a.txt', content: 'x' }], 'chore: blocked')
        ).rejects.toThrow('is archived');

        errorSpy.mockRestore();
    });

    it('should return file last modified date when commit exists', async () => {
        mockListCommits.mockResolvedValue({
            data: [{ commit: { committer: { date: '2024-01-01T00:00:00Z' } } }],
        });

        await expect(client.getFileLastModified('repo-1', 'README.md')).resolves.toBe('2024-01-01T00:00:00Z');
    });

    it('should return null when file last modified lookup fails', async () => {
        mockListCommits.mockRejectedValue(new Error('not found'));
        await expect(client.getFileLastModified('repo-1', 'README.md')).resolves.toBeNull();
    });

    it('should recursively list repo files', async () => {
        mockGetContent.mockImplementation(async ({ path }: { path: string }) => {
            if (path === '') {
                return {
                    data: [
                        { type: 'file', path: 'README.md' },
                        { type: 'dir', path: 'src' },
                    ],
                };
            }

            if (path === 'src') {
                return {
                    data: [
                        { type: 'file', path: 'src/index.ts' },
                    ],
                };
            }

            return { data: [] };
        });

        const files = await client.getRepoFileList('repo-1');
        expect(files).toEqual(['README.md', 'src/index.ts']);
    });

    it('should return empty file list on repo tree errors', async () => {
        mockGetContent.mockRejectedValue(new Error('api failure'));
        await expect(client.getRepoFileList('repo-1')).resolves.toEqual([]);
    });

    it('should return language stats and gracefully handle failures', async () => {
        mockListLanguages.mockResolvedValueOnce({ data: { TypeScript: 1000, JavaScript: 200 } });
        mockListLanguages.mockRejectedValueOnce(new Error('forbidden'));

        await expect(client.getLanguageStats('repo-1')).resolves.toEqual({ TypeScript: 1000, JavaScript: 200 });
        await expect(client.getLanguageStats('repo-1')).resolves.toEqual({});
    });

    it('should return workflow run status and fallback on errors', async () => {
        mockActionsListWorkflowRunsForRepo.mockResolvedValueOnce({
            data: {
                workflow_runs: [
                    {
                        conclusion: 'success',
                        updated_at: '2024-01-01T00:00:00Z',
                        created_at: '2023-12-31T00:00:00Z',
                        name: 'CI',
                    },
                ],
            },
        });

        mockActionsListWorkflowRunsForRepo.mockResolvedValueOnce({ data: { workflow_runs: [] } });
        mockActionsListWorkflowRunsForRepo.mockRejectedValueOnce(new Error('network'));

        await expect(client.getWorkflowRuns('repo-1')).resolves.toEqual({
            status: 'passing',
            lastRun: '2024-01-01T00:00:00Z',
            workflowName: 'CI',
        });
        await expect(client.getWorkflowRuns('repo-1')).resolves.toEqual({
            status: 'unknown',
            lastRun: null,
            workflowName: null,
        });
        await expect(client.getWorkflowRuns('repo-1')).resolves.toEqual({
            status: 'unknown',
            lastRun: null,
            workflowName: null,
        });
    });

    it('should return vulnerability alert totals', async () => {
        mockRequest.mockResolvedValueOnce({
            data: [
                { security_advisory: { severity: 'critical' } },
                { security_advisory: { severity: 'high' } },
                { security_advisory: { severity: 'high' } },
            ],
        });
        mockRequest.mockRejectedValueOnce(new Error('forbidden'));

        await expect(client.getVulnerabilityAlerts('repo-1')).resolves.toEqual({ total: 3, critical: 1, high: 2 });
        await expect(client.getVulnerabilityAlerts('repo-1')).resolves.toEqual({ total: 0, critical: 0, high: 0 });
    });

    it('should compute contributor stats and fallback on errors', async () => {
        mockListContributors.mockResolvedValueOnce({
            data: [
                { contributions: 80 },
                { contributions: 15 },
                { contributions: 5 },
            ],
        });
        mockGetCommitActivityStats.mockResolvedValueOnce({
            data: Array.from({ length: 12 }).map(() => ({ total: 6 })),
        });

        mockListContributors.mockRejectedValueOnce(new Error('denied'));

        await expect(client.getContributorStats('repo-1')).resolves.toEqual({
            contributorCount: 3,
            commitFrequency: 6,
            busFactor: 1,
        });
        await expect(client.getContributorStats('repo-1')).resolves.toEqual({
            contributorCount: 0,
            commitFrequency: 0,
            busFactor: 0,
        });
    });

    it('should compute pull request merge-time stats and fallback', async () => {
        mockPullsList.mockResolvedValueOnce({
            data: [
                {
                    created_at: '2024-01-01T00:00:00Z',
                    merged_at: '2024-01-01T10:00:00Z',
                    updated_at: '2024-01-01T10:00:00Z',
                },
                {
                    created_at: '2024-01-01T00:00:00Z',
                    merged_at: null,
                    updated_at: '2024-01-01T03:00:00Z',
                },
            ],
            headers: { etag: '"prs123"' },
            status: 200,
            url: '',
        });
        mockPullsList.mockResolvedValueOnce({ data: [] });
        mockPullsList.mockRejectedValueOnce(new Error('broken'));

        await expect(client.getPullRequestStats('repo-1')).resolves.toEqual({ avgMergeTimeHours: 10 });
        await expect(client.getPullRequestStats('repo-1')).resolves.toEqual({ avgMergeTimeHours: 0 });
        await expect(client.getPullRequestStats('repo-1')).resolves.toEqual({ avgMergeTimeHours: 0 });
    });

    it('should fetch security configuration details', async () => {
        mockGetContent.mockResolvedValueOnce({ data: { type: 'file' } });
        mockGetRepo.mockResolvedValueOnce({
            data: {
                security_and_analysis: {
                    private_vulnerability_reporting: { status: 'enabled' },
                },
            },
        });

        mockRequest.mockImplementation(async (route: string) => {
            if (route.includes('/security-advisories')) {
                return { data: [] };
            }
            if (route.includes('/dependabot/alerts')) {
                return { data: [{ id: 1 }] };
            }
            if (route.includes('/code-scanning/alerts')) {
                return { data: [{ id: 1 }, { id: 2 }] };
            }
            if (route.includes('/secret-scanning/alerts')) {
                return { data: [{ id: 1 }, { id: 2 }, { id: 3 }] };
            }
            return { data: [] };
        });

        await expect(client.getSecurityConfig('repo-1')).resolves.toEqual({
            hasSecurityPolicy: true,
            hasSecurityAdvisories: true,
            privateVulnerabilityReportingEnabled: true,
            dependabotAlertsEnabled: true,
            dependabotAlertCount: 1,
            codeScanningEnabled: true,
            codeScanningAlertCount: 2,
            secretScanningEnabled: true,
            secretScanningAlertCount: 3,
        });
    });

    it('should fallback to default security config when checks fail', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGetContent.mockRejectedValue(new Error('not found'));
        mockRequest.mockRejectedValue(new Error('not allowed'));
        mockGetRepo.mockRejectedValue(new Error('no access'));

        await expect(client.getSecurityConfig('repo-1')).resolves.toEqual({
            hasSecurityPolicy: false,
            hasSecurityAdvisories: false,
            privateVulnerabilityReportingEnabled: false,
            dependabotAlertsEnabled: false,
            dependabotAlertCount: 0,
            codeScanningEnabled: false,
            codeScanningAlertCount: 0,
            secretScanningEnabled: false,
            secretScanningAlertCount: 0,
        });

        errorSpy.mockRestore();
    });
});
