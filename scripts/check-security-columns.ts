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
        
        // Verify column is accessible by checking if it exists in the table structure
        const columnCheck = await db`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_name = 'repos' AND column_name = 'has_security_policy'
        `;
        if (columnCheck[0].count > 0) {
            logger.info('✓ has_security_policy column is accessible');
        } else {
            logger.warn('✗ has_security_policy column not found');
        }
        
    } catch (error) {
        logger.warn('Error:', error);
    }
}

checkSecurityColumns();
