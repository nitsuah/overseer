import { NextResponse } from 'next/server';
import logger from '@/lib/log';
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
            logger.warn('Column select failed:', e);
        }

    logger.debug('Columns in doc_status:', columns);
    logger.debug('DB Info:', dbInfo);
    logger.debug('Column health_state exists:', columnExists);

        return NextResponse.json({
            success: true,
            columns,
            dbInfo,
            columnExists
        });
    } catch (error: unknown) {
    logger.warn('Check schema error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
