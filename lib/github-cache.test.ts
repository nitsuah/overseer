import { beforeEach, describe, expect, it, vi } from 'vitest';
import { githubCache } from './github-cache';

describe('github-cache', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    githubCache.clear();
    githubCache.stopPruning();
  });

  it('should store and retrieve cache entries', () => {
    githubCache.set('repos:list', [{ name: 'repo' }], 'etag-1');

    const cached = githubCache.get('repos:list');
    expect(cached).toEqual({ data: [{ name: 'repo' }], etag: 'etag-1' });
  });

  it('should return null for missing keys', () => {
    expect(githubCache.get('missing')).toBeNull();
  });

  it('should expire entries older than maxAge', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    githubCache.set('old', 'value', 'etag-old');
    vi.setSystemTime(new Date('2026-01-01T00:06:00Z'));

    expect(githubCache.get('old')).toBeNull();
  });

  it('should prune only expired entries', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    githubCache.set('expired', 'value', 'etag-expired');
    vi.setSystemTime(new Date('2026-01-01T00:04:59Z'));
    githubCache.set('fresh', 'value', 'etag-fresh');

    vi.setSystemTime(new Date('2026-01-01T00:06:00Z'));
    githubCache.prune();

    expect(githubCache.get('expired')).toBeNull();
    expect(githubCache.get('fresh')).toEqual({ data: 'value', etag: 'etag-fresh' });
  });

  it('should start and stop pruning interval safely', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    githubCache.startPruning();
    githubCache.startPruning();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    githubCache.stopPruning();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });
});