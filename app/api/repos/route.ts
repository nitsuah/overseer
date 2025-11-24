import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';

export async function GET() {
    try {
        const db = getNeonClient();

        const repos = await db`
            SELECT * FROM repos
            WHERE is_hidden = FALSE OR is_hidden IS NULL
            ORDER BY 
                is_fork ASC,
                CASE 
                    WHEN repo_type = 'unknown' THEN 999
                    WHEN repo_type = 'web-app' THEN 1
                    WHEN repo_type = 'game' THEN 2
                    WHEN repo_type = 'tool' THEN 3
                    WHEN repo_type = 'library' THEN 4
                    WHEN repo_type = 'bot' THEN 5
                    WHEN repo_type = 'research' THEN 6
                    ELSE 999
                END ASC,
                stars DESC, 
                updated_at DESC
        `;

        return NextResponse.json(repos);
    } catch (error: any) {
        console.error('Error fetching repos:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

