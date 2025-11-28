import { config } from 'dotenv';
import { getNeonClient } from '../lib/db';
import fs from 'fs';
import path from 'path';
import logger from '../lib/log';

// Load environment variables
config({ path: '.env.local' });

async function migrateSchema() {
    const db = getNeonClient();
    
    logger.info('Starting schema migration...');
    
    try {
        // Read schema file
        const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        
        // Split by semicolon and execute each statement
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
            try {
                await db.unsafe(statement);
                logger.info('✓ Executed statement');
            } catch (error) {
                // Ignore errors for CREATE TABLE IF NOT EXISTS, etc.
                if (error instanceof Error && !error.message.includes('already exists')) {
                    logger.warn('Error executing statement:', error.message);
                    logger.debug('Statement:', statement.substring(0, 100));
                }
            }
        }
        
        logger.info('✓ Schema migration complete!');
    } catch (error) {
        logger.warn('Migration failed:', error);
        process.exit(1);
    }
}

migrateSchema();
