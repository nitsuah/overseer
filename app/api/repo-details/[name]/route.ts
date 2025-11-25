import { NextRequest, NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    const params = await props.params;
    try {
        const repoName = params.name;

        if (!repoName) {
            return NextResponse.json({ error: 'Repo name required' }, { status: 400 });
        }

        const db = getNeonClient();

        // Get repo
        const repoRows = await db`SELECT * FROM repos WHERE name = ${repoName} LIMIT 1`;

        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }

        const repo = repoRows[0];

        // Get tasks
        const tasks = await db`SELECT * FROM tasks WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;

        // Get roadmap items
        const roadmapItems = await db`SELECT * FROM roadmap_items WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;

        // Get metrics - note: metrics table uses 'timestamp' not 'created_at'
        const metrics = await db`SELECT * FROM metrics WHERE repo_id = ${repo.id} ORDER BY timestamp DESC`;

        // Get features - may not exist yet
        let features: unknown[] = [];
        try {
            features = await db`SELECT * FROM features WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
        } catch (e) {
            console.log('Features table not queried:', e);
        }

        // Get doc statuses
        let docStatuses: unknown[] = [];
        try {
            docStatuses = await db`SELECT * FROM doc_status WHERE repo_id = ${repo.id}`;
        } catch (e) {
            console.log('Doc status table not queried:', e);
        }

        // Get best practices - may not exist yet
        let bestPractices: unknown[] = [];
        try {
            bestPractices = await db`SELECT * FROM best_practices WHERE repo_id = ${repo.id}`;
        } catch (e) {
            console.log('Best practices table not queried:', e);
        }

        // Get community standards - may not exist yet
        let communityStandards: unknown[] = [];
        try {
            communityStandards = await db`SELECT * FROM community_standards WHERE repo_id = ${repo.id}`;
        } catch (e) {
            console.log('Community standards table not queried:', e);
        }

        return NextResponse.json({
            repo,
            tasks,
            roadmapItems,
            metrics,
            features,
            docStatuses,
            bestPractices,
            communityStandards
        });
    } catch (error: unknown) {
        console.error('Error fetching repo details:', error);
        return NextResponse.json({ error: 'Failed to fetch repo details' }, { status: 500 });
    }
}

