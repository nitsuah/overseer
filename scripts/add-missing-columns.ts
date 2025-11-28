import logger from '../lib/log';
import { config } from 'dotenv';
import { getNeonClient } from '../lib/db';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

async function addMissingColumns() {
    const db = getNeonClient();
    
        logger.info('Adding missing columns to existing tables...');
    
    try {
        // Read migration file
        const migrationPath = path.join(process.cwd(), 'database', 'add_missing_columns.sql');
        const migration = fs.readFileSync(migrationPath, 'utf-8');
        
        // Split by semicolon and execute each statement
        const statements = migration
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
            try {
                await db.unsafe(statement);
                    logger.info('✓ Executed statement');
            } catch (error) {
                if (error instanceof Error) {
                        logger.warn('Error executing statement:', error.message);
                }
            }
        }
        
            logger.info('✓ Column migration complete!');
    } catch (error) {
            logger.warn('Migration failed:', error);
        process.exit(1);
    }
}

addMissingColumns();
