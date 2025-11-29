/* eslint-disable @typescript-eslint/no-explicit-any */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { join } from 'path';
import logger from '../lib/log';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function addIsHiddenColumn() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        logger.warn('❌ DATABASE_URL not configured');
        process.exit(1);
    }

    logger.info('📦 Adding is_hidden column to repos table...');

    const db = neon(databaseUrl);

    try {
        const sql = db as any;
        await sql.query('ALTER TABLE repos ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE');
        logger.info('✅ Column added successfully!');
    } catch (error: any) {
        logger.warn('❌ Error:', error.message);
        process.exit(1);
    }
}

addIsHiddenColumn();
