
import { getNeonClient } from '../lib/db';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    console.log('Starting migration...');
    try {
        const db = getNeonClient();

        // Add is_hidden column
        console.log('Adding is_hidden column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE`;

        // Add health_score column
        console.log('Adding health_score column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 0`;

        // Add testing_status column
        console.log('Adding testing_status column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS testing_status TEXT`;

        // Add coverage_score column
        console.log('Adding coverage_score column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS coverage_score NUMERIC(5,2)`;

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
