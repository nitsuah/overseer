import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const db = getNeonClient();

        // Get repo ID
        const repos = await db`
            SELECT id, name, full_name FROM repos WHERE name = ${name}
        `;
        
        if (repos.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }

        const repo = repos[0];
        const repoId = repo.id;

        // Get all related data
        const [roadmapItems, tasks, features, metrics, docStatus] = await Promise.all([
            db`SELECT * FROM roadmap_items WHERE repo_id = ${repoId} ORDER BY id`,
            db`SELECT * FROM tasks WHERE repo_id = ${repoId} ORDER BY id`,
            db`SELECT * FROM features WHERE repo_id = ${repoId} ORDER BY id`,
            db`SELECT * FROM metrics WHERE repo_id = ${repoId} ORDER BY id`,
            db`SELECT * FROM doc_status WHERE repo_id = ${repoId} ORDER BY doc_type`,
        ]);

        return NextResponse.json({
            repo: {
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
            },
            counts: {
                roadmap_items: roadmapItems.length,
                tasks: tasks.length,
                features: features.length,
                metrics: metrics.length,
                doc_status: docStatus.length,
            },
            data: {
                roadmap_items: roadmapItems,
                tasks: tasks,
                features: features,
                metrics: metrics,
                doc_status: docStatus,
            },
        }, { status: 200 });
    } catch (error: unknown) {
        console.error('Debug error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
