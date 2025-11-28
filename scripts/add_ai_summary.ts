
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

        // Add ai_summary column
    logger.info('Adding ai_summary column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS ai_summary TEXT`;

        logger.info('Migration complete.');
        process.exit(0);
    } catch (error) {
        logger.warn('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
