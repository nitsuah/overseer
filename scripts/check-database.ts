import { config } from 'dotenv';
import { getNeonClient } from '../lib/db';
import logger from '../lib/log';

// Load environment variables
config({ path: '.env.local' });

async function checkDatabase() {
    const db = getNeonClient();
    
    logger.info('Checking database connection...');
    
    try {
        // Check current database
        const dbInfo = await db`SELECT current_database(), current_schema()`;
        logger.info('Database:', dbInfo[0].current_database);
        logger.info('Schema:', dbInfo[0].current_schema);
        
        // List all columns in repos table
        const allColumns = await db`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'repos'
            AND table_schema = current_schema()
            ORDER BY ordinal_position;
        `;
        
        logger.info(`\nRepos table has ${allColumns.length} columns:`);
        allColumns.forEach((col: { column_name: string; data_type: string }) => {
            const suffix = col.column_name.includes('security') || col.column_name.includes('scanning') || col.column_name.includes('dependabot') ? ' <-- SECURITY' : '';
            logger.info(`  - ${col.column_name} (${col.data_type})${suffix}`);
        });
        
    } catch (error) {
        logger.warn('Error:', error);
    }
}

checkDatabase();
