import { neon } from '@neondatabase/serverless';
import { SCHEMA_MIGRATIONS } from './schema-migrations';
import logger from './log';

// Neon serverless Postgres client
export function getNeonClient() {
    // Netlify's Neon integration uses NETLIFY_DATABASE_URL
    // Local development uses DATABASE_URL from .env.local
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL not configured');
    }
    return neon(databaseUrl);
}

let schemaEnsured = false;

// @neondatabase/serverless's HTTP driver has no built-in query timeout, and
// its tagged-template call form (the one used throughout this codebase, e.g.
// persistReceipt in app/api/agent/tasks/route.ts) exposes no abort/signal
// hook to pass one in. A hung request -- a Neon-side stall, a bad network
// path -- would otherwise block whatever awaited it forever. For
// processQueue specifically, that means runnerActive never resets and every
// later-enqueued task stalls behind it for the rest of that warm instance's
// life. Racing the query against a timer bounds *wait time*: the caller is
// guaranteed to get control back within NEON_QUERY_TIMEOUT_MS regardless of
// what the underlying HTTP request is doing (it isn't cancelled, so it may
// keep running in the background -- this trades a small amount of wasted
// background work for guaranteed forward progress, which is the actual
// requirement here).
export const NEON_QUERY_TIMEOUT_MS = 10_000;

export async function withQueryTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
            () => reject(new Error(`${label} timed out after ${NEON_QUERY_TIMEOUT_MS}ms`)),
            NEON_QUERY_TIMEOUT_MS,
        );
    });

    try {
        return await Promise.race([promise, timeout]);
    } finally {
        clearTimeout(timer!);
    }
}

/**
 * Applies SCHEMA_MIGRATIONS so the live database self-heals when code starts
 * relying on columns/indexes that haven't been added to production yet.
 * Cached per warm serverless instance - subsequent calls are no-ops.
 */
export async function ensureSchema(db: ReturnType<typeof getNeonClient>): Promise<void> {
    if (schemaEnsured) return;

    for (const statement of SCHEMA_MIGRATIONS) {
        try {
            await withQueryTimeout(db.query(statement), 'schema migration');
        } catch (error) {
            const err = error as Error & { code?: string };
            // 42701 = duplicate_column, 42P07 = duplicate_table, 42710 = duplicate_object
            // These are expected on idempotent re-runs; all other errors are real failures.
            const benign = err.code === '42701' || err.code === '42P07' || err.code === '42710';
            if (!benign) {
                throw err;
            }
        }
    }

    schemaEnsured = true;
}

// Database types
export interface Repo {
    id: string;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    open_issues: number;
    branches_count: number;
    url: string;
    homepage: string | null;
    topics: string[];
    last_synced: string;
    created_at: string;
    updated_at: string;
    is_hidden: boolean;
    health_score: number;
    testing_status: string | null;
    coverage_score: number | null;
    ai_summary: string | null;
    last_commit_date: string | null;
    open_prs: number;
    prs_ready_count: number;
    prs_blocked_count: number;
    stale_review_count: number;
    zombie_branch_count: number;
    token_density: number | null;
    comment_to_code_ratio: number | null;
    open_issues_count: number;
    readme_last_updated: string | null;
}

export interface Task {
    id: string;
    repo_id: string;
    task_id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    section: string | null;
    created_at: string;
    updated_at: string;
}

export interface RoadmapItem {
    id: string;
    repo_id: string;
    title: string;
    quarter: string | null;
    status: 'planned' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | null;
    created_at: string;
    updated_at: string;
}

export interface Metric {
    id: string;
    repo_id: string;
    metric_name: string;
    value: number;
    unit: string | null;
    timestamp: string;
}

export interface DocStatus {
    id: string;
    repo_id: string;
    doc_type: 'readme' | 'roadmap' | 'tasks' | 'changelog' | 'contributing' | 'metrics' | 'other';
    exists: boolean;
    last_checked: string;
}
