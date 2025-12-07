import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatTimeAgo,
  formatDate,
  getCommitFreshnessColor,
  getReadmeFreshnessColor,
  getFreshnessLabel,
} from './date-utils';

describe('date-utils', () => {
  beforeEach(() => {
    // Mock current date to 2025-01-01
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatTimeAgo', () => {
    it('should return "Never" for null or undefined', () => {
      expect(formatTimeAgo(null)).toBe('Never');
      expect(formatTimeAgo(undefined)).toBe('Never');
    });

    it('should return "Today" for today', () => {
      expect(formatTimeAgo('2025-01-01T00:00:00.000Z')).toBe('Today');
    });

    it('should return "1d ago" for yesterday', () => {
      expect(formatTimeAgo('2024-12-31T00:00:00.000Z')).toBe('1d ago');
    });

    it('should return days for < 7 days', () => {
      expect(formatTimeAgo('2024-12-28T00:00:00.000Z')).toBe('4d ago');
    });

    it('should return weeks for < 30 days', () => {
      expect(formatTimeAgo('2024-12-18T00:00:00.000Z')).toBe('2w ago');
    });

    it('should return months for < 365 days', () => {
      expect(formatTimeAgo('2024-10-01T00:00:00.000Z')).toBe('3M ago');
    });

    it('should return years for >= 365 days', () => {
      expect(formatTimeAgo('2023-01-01T00:00:00.000Z')).toBe('2Y ago');
    });
  });

  describe('formatDate', () => {
    it('should return "N/A" for null or undefined', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('should format date correctly', () => {
      expect(formatDate('2024-12-25T00:00:00.000Z')).toMatch(/Dec 2[45], 2024/);
    });
  });

  describe('getCommitFreshnessColor', () => {
    it('should return slate for null/undefined', () => {
      expect(getCommitFreshnessColor(null)).toBe('text-slate-500');
      expect(getCommitFreshnessColor(undefined)).toBe('text-slate-500');
    });

    it('should return green for < 7 days', () => {
      expect(getCommitFreshnessColor('2024-12-29T00:00:00.000Z')).toBe('text-green-400');
    });

    it('should return yellow for 7-29 days', () => {
      expect(getCommitFreshnessColor('2024-12-15T00:00:00.000Z')).toBe('text-yellow-400');
    });

    it('should return orange for 30-89 days', () => {
      expect(getCommitFreshnessColor('2024-11-01T00:00:00.000Z')).toBe('text-orange-400');
    });

    it('should return red for >= 90 days', () => {
      expect(getCommitFreshnessColor('2024-09-01T00:00:00.000Z')).toBe('text-red-400');
    });
  });

  describe('getReadmeFreshnessColor', () => {
    it('should return slate for null/undefined', () => {
      expect(getReadmeFreshnessColor(null)).toBe('text-slate-500');
      expect(getReadmeFreshnessColor(undefined)).toBe('text-slate-500');
    });

    it('should return green for < 30 days', () => {
      expect(getReadmeFreshnessColor('2024-12-15T00:00:00.000Z')).toBe('text-green-400');
    });

    it('should return yellow for 30-89 days', () => {
      expect(getReadmeFreshnessColor('2024-11-01T00:00:00.000Z')).toBe('text-yellow-400');
    });

    it('should return orange for 90-179 days', () => {
      expect(getReadmeFreshnessColor('2024-08-01T00:00:00.000Z')).toBe('text-orange-400');
    });

    it('should return red for >= 180 days', () => {
      expect(getReadmeFreshnessColor('2024-06-01T00:00:00.000Z')).toBe('text-red-400');
    });
  });

  describe('getFreshnessLabel', () => {
    it('should return "Missing" for null/undefined', () => {
      expect(getFreshnessLabel(null)).toBe('Missing');
      expect(getFreshnessLabel(undefined)).toBe('Missing');
    });

    it('should return "Fresh" for < 30 days', () => {
      expect(getFreshnessLabel('2024-12-15T00:00:00.000Z')).toBe('Fresh');
    });

    it('should return "Aging" for 30-89 days', () => {
      expect(getFreshnessLabel('2024-11-01T00:00:00.000Z')).toBe('Aging');
    });

    it('should return "Stale" for 90-179 days', () => {
      expect(getFreshnessLabel('2024-08-01T00:00:00.000Z')).toBe('Stale');
    });

    it('should return "Old" for >= 180 days', () => {
      expect(getFreshnessLabel('2024-06-01T00:00:00.000Z')).toBe('Old');
    });
  });
});
