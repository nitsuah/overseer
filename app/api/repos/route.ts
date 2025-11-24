import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';

export async function GET() {
    try {
        const db = getNeonClient();

        const repos = await db`
            SELECT * FROM repos
            ORDER BY is_fork ASC, stars DESC, updated_at DESC
        `;

        return NextResponse.json(repos);
    } catch (error: any) {
        console.error('Error fetching repos:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

