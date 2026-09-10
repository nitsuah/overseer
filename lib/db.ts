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

/**
 * Applies SCHEMA_MIGRATIONS so the live database self-heals when code starts
 * relying on columns/indexes that haven't been added to production yet.
 * Cached per warm serverless instance - subsequent calls are no-ops.
 */
export async function ensureSchema(db: ReturnType<typeof getNeonClient>): Promise<void> {
    if (schemaEnsured) return;

    for (const statement of SCHEMA_MIGRATIONS) {
        try {
            await db.query(statement);
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
