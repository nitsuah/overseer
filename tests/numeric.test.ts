import { describe, it, expect } from 'vitest';
import {
    toNumberOrNull,
    coerceNumericColumns,
    normalizeRepoRow,
    normalizeSnapshotRow,
    normalizeMetricRow,
} from '@/lib/numeric';

describe('toNumberOrNull', () => {
    it('parses the numeric strings the Neon driver returns for NUMERIC', () => {
        expect(toNumberOrNull('21.7')).toBe(21.7);
        expect(toNumberOrNull('0')).toBe(0);
        expect(toNumberOrNull(4)).toBe(4);
    });

    it('returns null for missing or non-finite values instead of NaN', () => {
        expect(toNumberOrNull(null)).toBeNull();
        expect(toNumberOrNull(undefined)).toBeNull();
        expect(toNumberOrNull('')).toBeNull();
        expect(toNumberOrNull('NaN')).toBeNull();
        expect(toNumberOrNull('abc')).toBeNull();
        expect(toNumberOrNull(Infinity)).toBeNull();
    });
});

describe('row normalizers', () => {
    it('coerces every NUMERIC column on a repos row and leaves the rest alone', () => {
        const row = normalizeRepoRow({
            name: 'x',
            stars: 5,
            token_density: '8.25',
            comment_to_code_ratio: '0.18',
            commit_frequency: '12.5',
            avg_pr_merge_time_hours: '21.7',
            coverage_score: '83.34',
        });
        expect(row).toMatchObject({
            name: 'x',
            stars: 5,
            token_density: 8.25,
            comment_to_code_ratio: 0.18,
            commit_frequency: 12.5,
            avg_pr_merge_time_hours: 21.7,
            coverage_score: 83.34,
        });
    });

    it('does not invent columns that are absent', () => {
        expect('token_density' in normalizeRepoRow({ name: 'x' })).toBe(false);
    });

    it('turns NULL numerics into null so .toFixed guards behave', () => {
        expect(normalizeRepoRow({ token_density: null }).token_density).toBeNull();
    });

    it('normalizes snapshot and metric rows', () => {
        expect(normalizeSnapshotRow({ commit_frequency: '3.2', avg_pr_merge_time_hours: '29.1', health_score: 88 }))
            .toEqual({ commit_frequency: 3.2, avg_pr_merge_time_hours: 29.1, health_score: 88 });
        expect(normalizeMetricRow({ metric_name: 'loc', value: '100' })).toEqual({ metric_name: 'loc', value: 100 });
    });

    it('does not mutate its input', () => {
        const input = { token_density: '8.25' };
        coerceNumericColumns(input, ['token_density']);
        expect(input.token_density).toBe('8.25');
    });
});
