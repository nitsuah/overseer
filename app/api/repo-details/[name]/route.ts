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
        const repoRows = await db`
            SELECT * FROM repos WHERE name = ${repoName} LIMIT 1
        `;

        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }

        const repo = repoRows[0];

        // Get tasks
        const tasks = await db`
            SELECT * FROM tasks
            WHERE repo_id = ${repo.id}
            ORDER BY created_at DESC
        `;

        // Get roadmap items
        const roadmapItems = await db`
            SELECT * FROM roadmap_items
            WHERE repo_id = ${repo.id}
            ORDER BY created_at DESC
        `;

        // Get metrics
        const metrics = await db`
            SELECT * FROM metrics
            WHERE repo_id = ${repo.id}
            ORDER BY created_at DESC
            LIMIT 1
        `;

        // Get features
        const features = await db`
            SELECT * FROM features
            WHERE repo_id = ${repo.id}
            ORDER BY created_at DESC
        `;

        return NextResponse.json({
            repo,
            tasks,
            roadmapItems,
            metrics: metrics[0] || null,
            features
        });
    } catch (error: unknown) {
        console.error('Error fetching repo details:', error);
        return NextResponse.json({ error: 'Failed to fetch repo details' }, { status: 500 });
    }
}

