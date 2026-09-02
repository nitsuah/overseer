import { describe, it, expect, vi, afterEach } from 'vitest';
import { detectActivityState, calculateVelocityScore, MAINTENANCE_MODE_DAYS } from '@/lib/repo-signals';

afterEach(() => {
  vi.useRealTimers();
});

describe('detectActivityState', () => {
  it('returns active for recent commits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
    expect(detectActivityState('2026-08-20T00:00:00Z')).toBe('active');
  });

  it('returns stale for 30-90 day old commits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
    expect(detectActivityState('2026-06-15T00:00:00Z')).toBe('stale');
  });

  it('returns maintenance for 90+ day old commits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
    expect(detectActivityState('2026-01-01T00:00:00Z')).toBe('maintenance');
  });

  it('treats missing date as maintenance', () => {
    expect(detectActivityState(null)).toBe('maintenance');
    expect(detectActivityState(undefined)).toBe('maintenance');
  });

  it('boundary: exactly 30 days is active', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
    expect(detectActivityState('2026-08-02T00:00:00Z')).toBe('active');
  });

  it('boundary: exactly 90 days is stale (not maintenance)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
    expect(detectActivityState('2026-06-03T00:00:00Z')).toBe('stale');
  });
});

describe('calculateVelocityScore', () => {
  it('returns null when no signals available', () => {
    expect(calculateVelocityScore({})).toBeNull();
    expect(calculateVelocityScore({ commitFrequency: null, avgPrMergeTimeHours: null })).toBeNull();
  });

  it('scores high for frequent commits and fast merges', () => {
    const score = calculateVelocityScore({ commitFrequency: 10, avgPrMergeTimeHours: 12 });
    expect(score).toBe(100);
  });

  it('scores low for slow merges', () => {
    const score = calculateVelocityScore({ commitFrequency: 0, avgPrMergeTimeHours: 300 });
    expect(score).toBe(40);
  });

  it('clamps to 0-100', () => {
    expect(calculateVelocityScore({ commitFrequency: 100, avgPrMergeTimeHours: 1 })).toBe(100);
    expect(calculateVelocityScore({ commitFrequency: 0, avgPrMergeTimeHours: 1000 })).toBe(40);
  });

  it('uses commit frequency alone', () => {
    expect(calculateVelocityScore({ commitFrequency: 5 })).toBe(70);
  });
});