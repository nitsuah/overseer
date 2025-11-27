import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';

export async function POST() {
    try {
        const db = getNeonClient();

        // Check columns in doc_status table
        const columns = await db`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'doc_status'
        `;

        const dbInfo = await db`SELECT current_database(), current_user, version()`;

        let columnExists = false;
        try {
            await db`SELECT health_state FROM doc_status LIMIT 1`;
            columnExists = true;
        } catch (e) {
            console.log('Column select failed:', e);
        }

        console.log('Columns in doc_status:', columns);
        console.log('DB Info:', dbInfo);
        console.log('Column health_state exists:', columnExists);

        return NextResponse.json({
            success: true,
            columns,
            dbInfo,
            columnExists
        });
    } catch (error: unknown) {
        console.error('Check schema error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
