// Postgres NUMERIC columns come back from the Neon driver as *strings*
// ("21.7"), not numbers, while types/repo.ts declares them `number`. Anything
// that calls .toFixed() (or does arithmetic) on one of them without
// coercing throws or silently concatenates -- an unguarded .toFixed() is what
// crashed the whole dashboard whenever a repo row was expanded.
//
// Normalize once, at the API boundary, so the client receives real numbers and
// the declared types tell the truth.

export function toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
}

/** `repos` columns declared NUMERIC in database/schema.sql. */
export const REPO_NUMERIC_COLUMNS = [
    'coverage_score',
    'commit_frequency',
    'avg_pr_merge_time_hours',
    'token_density',
    'comment_to_code_ratio',
] as const;

/** `repo_snapshots` columns declared NUMERIC. */
export const SNAPSHOT_NUMERIC_COLUMNS = ['commit_frequency', 'avg_pr_merge_time_hours'] as const;

/** `metrics.value` is NUMERIC NOT NULL. */
export const METRIC_NUMERIC_COLUMNS = ['value'] as const;

export function coerceNumericColumns<T extends Record<string, unknown>>(
    row: T,
    columns: readonly string[]
): T {
    const out: Record<string, unknown> = { ...row };
    for (const column of columns) {
        if (column in out) out[column] = toNumberOrNull(out[column]);
    }
    return out as T;
}

export const normalizeRepoRow = <T extends Record<string, unknown>>(row: T): T =>
    coerceNumericColumns(row, REPO_NUMERIC_COLUMNS);

export const normalizeSnapshotRow = <T extends Record<string, unknown>>(row: T): T =>
    coerceNumericColumns(row, SNAPSHOT_NUMERIC_COLUMNS);

export const normalizeMetricRow = <T extends Record<string, unknown>>(row: T): T =>
    coerceNumericColumns(row, METRIC_NUMERIC_COLUMNS);
