import { describe, it, expect } from 'vitest';
import { filterReposForSync, SyncFilters } from '@/lib/sync-filters';
import type { RepoMetadata } from '@/lib/github';

function repo(overrides: Partial<RepoMetadata> & { name: string }): RepoMetadata {
  return {
    fullName: `owner/${overrides.name}`,
    description: null,
    language: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    defaultBranch: 'main',
    url: `https://github.com/owner/${overrides.name}`,
    homepage: null,
    topics: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    pushedAt: '2024-01-01T00:00:00Z',
    isFork: false,
    archived: false,
    ...overrides,
  };
}

const repos: RepoMetadata[] = [
  repo({ name: 'web-app', language: 'TypeScript', topics: ['nextjs'] }),
  repo({ name: 'game', language: 'JavaScript', topics: ['game'] }),
  repo({ name: 'tool', language: 'Python', topics: ['cli'] }),
  repo({ name: 'forked', language: 'TypeScript', isFork: true }),
  repo({ name: 'archived-repo', language: 'Go', archived: true }),
];

describe('filterReposForSync', () => {
  it('returns all non-hidden, non-archived repos when no filters', () => {
    const result = filterReposForSync(repos, {}, new Map());
    expect(result.map((r) => r.name)).toEqual(['web-app', 'game', 'tool', 'forked']);
  });

  it('filters by type', () => {
    const result = filterReposForSync(repos, { filterType: 'game' }, new Map());
    expect(result.map((r) => r.name)).toEqual(['game']);
  });

  it('filters by language', () => {
    const result = filterReposForSync(repos, { filterLanguage: 'TypeScript' }, new Map());
    expect(result.map((r) => r.name)).toEqual(['web-app', 'forked']);
  });

  it('filters out forks with no-forks', () => {
    const result = filterReposForSync(repos, { filterFork: 'no-forks' }, new Map());
    expect(result.map((r) => r.name)).toEqual(['web-app', 'game', 'tool']);
  });

  it('keeps only forks with forks-only', () => {
    const result = filterReposForSync(repos, { filterFork: 'forks-only' }, new Map());
    expect(result.map((r) => r.name)).toEqual(['forked']);
  });

  it('drops repos hidden in the DB', () => {
    const dbMap = new Map([['web-app', { name: 'web-app', is_hidden: true }]]);
    const result = filterReposForSync(repos, {}, dbMap);
    expect(result.map((r) => r.name)).not.toContain('web-app');
  });

  it('drops repos archived in the DB even if GitHub says not archived', () => {
    const dbMap = new Map([['tool', { name: 'tool', is_archived: true }]]);
    const result = filterReposForSync(repos, {}, dbMap);
    expect(result.map((r) => r.name)).not.toContain('tool');
  });

  it('uses DB repo_type when present', () => {
    const dbMap = new Map([['web-app', { name: 'web-app', repo_type: 'library' }]]);
    const result = filterReposForSync(repos, { filterType: 'library' }, dbMap);
    expect(result.map((r) => r.name)).toEqual(['web-app']);
  });

  it('combines filters', () => {
    const result = filterReposForSync(
      repos,
      { filterType: 'web-app', filterLanguage: 'TypeScript', filterFork: 'no-forks' },
      new Map()
    );
    expect(result.map((r) => r.name)).toEqual(['web-app']);
  });
});