
import { getNeonClient } from '../lib/db';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    console.log('Starting migration...');
    try {
        const db = getNeonClient();

        // Add ai_summary column
        console.log('Adding ai_summary column...');
        await db`ALTER TABLE repos ADD COLUMN IF NOT EXISTS ai_summary TEXT`;

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
