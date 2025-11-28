import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';
import logger from '@/lib/log';

export async function POST() {
    try {
        const db = getNeonClient();

    logger.info('Starting migration phase 3 (Constraint Fix)...');
        const results = [];

        // Drop the restrictive check constraint on doc_type
        try {
            await db`ALTER TABLE doc_status DROP CONSTRAINT IF EXISTS doc_status_doc_type_check`;
            logger.info('✓ Dropped doc_status_doc_type_check constraint');
            results.push({ success: true, statement: 'drop doc_type check constraint' });
        } catch (e) {
            logger.warn('Failed to drop doc_type check constraint:', e);
            results.push({ success: false, statement: 'drop doc_type check constraint', error: (e as Error).message });
        }

        return NextResponse.json({
            success: true,
            results
        });
    } catch (error: unknown) {
        logger.warn('Migration error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
