
import { getNeonClient } from '../lib/db';
import * as dotenv from 'dotenv';
import path from 'path';
import logger from '../lib/log';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    logger.info('Starting migration...');
    try {
        const db = getNeonClient();

        // Add is_hidden column
    logger.info('Adding is_hidden column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE`;

        // Add health_score column
    logger.info('Adding health_score column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 0`;

        // Add testing_status column
    logger.info('Adding testing_status column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS testing_status TEXT`;

        // Add coverage_score column
        logger.info('Adding coverage_score column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS coverage_score NUMERIC(5,2)`;
        logger.info('Migration complete.');
        process.exit(0);
    } catch (error) {
        logger.warn('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
