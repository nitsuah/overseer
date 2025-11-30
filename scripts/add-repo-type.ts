/* eslint-disable @typescript-eslint/no-explicit-any */
import { neon } from '@neondatabase/serverless';
import logger from '../lib/log';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function addRepoTypeColumn() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        logger.warn('❌ DATABASE_URL not configured');
        process.exit(1);
    }

    logger.info('📦 Adding repo_type column to repos table...');

    const db = neon(databaseUrl);

    try {
        const sql = db as any;
        await sql.query('ALTER TABLE repos ADD COLUMN IF NOT EXISTS repo_type TEXT DEFAULT \'unknown\'');
        logger.info('✅ Column added successfully!');
    } catch (error: any) {
        logger.warn('❌ Error:', error.message);
        process.exit(1);
    }
}

addRepoTypeColumn().catch((error: any) => {
    logger.warn('❌ Unhandled error:', error?.message || error);
    process.exit(1);
});
