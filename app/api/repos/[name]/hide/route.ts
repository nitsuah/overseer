import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { name: string } }
) {
    try {
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const repoName = params.name;
        const db = getNeonClient();

        await db`
            UPDATE repos 
            SET is_hidden = TRUE 
            WHERE name = ${repoName}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error hiding repo:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

