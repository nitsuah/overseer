import { neon } from '@neondatabase/serverless';

// Neon serverless Postgres client
export function getNeonClient() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
    }
    return neon(databaseUrl);
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
