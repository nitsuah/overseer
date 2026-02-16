import { config } from 'dotenv';
import { getNeonClient } from '../lib/db';
import logger from '../lib/log';

// Load environment variables
config({ path: '.env.local' });

async function checkSecurityColumns() {
    const db = getNeonClient();
    
    logger.info('Checking for security columns in repos table...');
    
    try {
        // Query to check if columns exist
        const result = await db`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'repos' 
            AND (
                column_name LIKE 'has_security%' 
                OR column_name LIKE '%scanning%' 
                OR column_name LIKE '%vuln%'
                OR column_name LIKE '%dependabot%'
                OR column_name = 'security_last_checked'
                OR column_name = 'private_vuln_reporting_enabled'
            )
            ORDER BY column_name;
        `;
        
        logger.info(`Found ${result.length} security-related columns:`);
        result.forEach((col: { column_name: string; data_type: string }) => {
            logger.info(`  - ${col.column_name} (${col.data_type})`);
        });
        
        // Try a simple query to verify column is accessible
        await db`SELECT has_security_policy FROM repos LIMIT 1`;
        logger.info('✓ Successfully queried has_security_policy column');
        
    } catch (error) {
        logger.warn('Error:', error);
    }
}

checkSecurityColumns();
