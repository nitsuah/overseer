
import { getNeonClient } from '../lib/db';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    console.log('Starting migration: adding baseline metrics columns...');
    try {
        const db = getNeonClient();

        console.log('Adding last_commit_date column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS last_commit_date TIMESTAMP`;

        console.log('Adding open_prs column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS open_prs INTEGER DEFAULT 0`;

        console.log('Adding open_issues_count column (if not exists)...');
        // Note: open_issues already exists, but let's ensure we have a count column
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS open_issues_count INTEGER DEFAULT 0`;

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
