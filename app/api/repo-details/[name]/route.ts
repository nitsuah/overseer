import { NextRequest, NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { name: string } }
) {
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

        // Get doc statuses
        const docStatuses = await db`
            SELECT * FROM doc_status
            WHERE repo_id = ${repo.id}
        `;

        return NextResponse.json({
            tasks: tasks || [],
            roadmapItems: roadmapItems || [],
            docStatuses: docStatuses || [],
        });
    } catch (error: any) {
        console.error('Error fetching repo details:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

