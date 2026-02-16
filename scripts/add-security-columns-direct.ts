import { config } from 'dotenv';
import { getNeonClient } from '../lib/db';
import logger from '../lib/log';

// Load environment variables
config({ path: '.env.local' });

async function addSecurityColumns() {
    const db = getNeonClient();
    
    logger.info('Adding security columns one by one...');
    
    const columns = [
        { name: 'has_security_policy', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'has_security_advisories', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'private_vuln_reporting_enabled', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'dependabot_alerts_enabled', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'dependabot_alert_count', type: 'INTEGER DEFAULT 0' },
        { name: 'code_scanning_enabled', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'code_scanning_alert_count', type: 'INTEGER DEFAULT 0' },
        { name: 'secret_scanning_enabled', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'secret_scanning_alert_count', type: 'INTEGER DEFAULT 0' },
        { name: 'security_last_checked', type: 'TIMESTAMP WITH TIME ZONE' },
    ];
    
    for (const col of columns) {
        try {
            await db.unsafe(`ALTER TABLE repos ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
            logger.info(`✓ Added column: ${col.name}`);
        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            if (err.message?.includes('already exists') || err.code === '42701') {
                logger.info(`⊘ Column already exists: ${col.name}`);
            } else {
                logger.warn(`✗ Failed to add ${col.name}:`, err.message);
            }
        }
    }
    
    // Add indexes
    try {
        await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_repos_security_policy ON repos(has_security_policy);`);
        logger.info('✓ Added index: idx_repos_security_policy');
    } catch {
        logger.info('⊘ Index may already exist');
    }
    
    try {
        await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_repos_security_last_checked ON repos(security_last_checked);`);
        logger.info('✓ Added index: idx_repos_security_last_checked');
    } catch {
        logger.info('⊘ Index may already exist');
    }
    
    logger.info('✓ Done!');
}

addSecurityColumns();
