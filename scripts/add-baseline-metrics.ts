
import { getNeonClient } from '../lib/db';
import * as dotenv from 'dotenv';
import path from 'path';
import logger from '../lib/log';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    logger.info('Starting migration: adding baseline metrics columns...');
    try {
        const db = getNeonClient();

    logger.info('Adding last_commit_date column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS last_commit_date TIMESTAMP`;

    logger.info('Adding open_prs column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS open_prs INTEGER DEFAULT 0`;

    logger.info('Adding open_issues_count column (if not exists)...');
        // Note: open_issues already exists, but let's ensure we have a count column
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS open_issues_count INTEGER DEFAULT 0`;

        logger.info('Migration complete.');
        process.exit(0);
    } catch (error) {
        logger.warn('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
