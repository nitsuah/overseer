import { config } from 'dotenv';
import { getNeonClient } from '../lib/db';
import fs from 'fs';
import path from 'path';
import logger from '../lib/log';

// Load environment variables
config({ path: '.env.local' });

async function migratePrReadinessColumns() {
    logger.info('Starting migration 009: Add PR readiness breakdown columns...');

    try {
        const db = getNeonClient();

        // Read migration file
        const migrationPath = path.join(process.cwd(), 'database', 'migrations', '009_add_pr_readiness.sql');
        const migration = fs.readFileSync(migrationPath, 'utf-8');

        // Split by semicolon and execute each statement
        const statements = migration
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            try {
                await db.unsafe(statement);
                logger.info('✓ Executed:', statement.substring(0, 80) + '...');
            } catch (error) {
                if (error instanceof Error) {
                    // Ignore "already exists" errors
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (error.message.includes('already exists') || (error as any).code === '42701') {
                        logger.info('⊘ Already exists:', statement.substring(0, 80) + '...');
                    } else {
                        logger.warn('Error executing statement:', error.message);
                        logger.debug('Statement:', statement);
                        throw error;
                    }
                }
            }
        }

        logger.info('✓ Migration 009 complete!');
        logger.info('PR readiness breakdown columns added successfully.');
    } catch (error) {
        logger.error('Migration 009 failed:', error);
        process.exit(1);
    }
}

migratePrReadinessColumns().catch(err => {
    logger.error('Unhandled error:', err);
    process.exit(1);
});
