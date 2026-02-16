import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import logger from '../lib/log';

// Load environment variables
config({ path: '.env.local' });

async function addSecurityColumnsRaw() {
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

    if (!databaseUrl) {
        logger.warn('No database URL found');
        process.exit(1);
    }

    logger.info('Using configured database connection URL');
    const sql = neon(databaseUrl);

    logger.info('Adding security columns with raw SQL...\n');

    const statements = [
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS has_security_policy BOOLEAN DEFAULT FALSE",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS has_security_advisories BOOLEAN DEFAULT FALSE",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS private_vuln_reporting_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS dependabot_alerts_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS dependabot_alert_count INTEGER DEFAULT 0",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS code_scanning_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS code_scanning_alert_count INTEGER DEFAULT 0",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS secret_scanning_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS secret_scanning_alert_count INTEGER DEFAULT 0",
        "ALTER TABLE repos ADD COLUMN IF NOT EXISTS security_last_checked TIMESTAMP WITH TIME ZONE",
    ];

    let hasFailure = false;

    for (const stmt of statements) {
        try {
            logger.info(`Executing: ${stmt}`);
            // Use .unsafe for raw string execution as suggested in PR feedback
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (sql as any).unsafe(stmt);
            logger.info('✓ Success\n');
        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            if (err.message?.includes('already exists') || err.code === '42701') {
                logger.info('⊘ Column already exists\n');
            } else {
                logger.warn(`✗ Error: ${err.message}\n`);
                hasFailure = true;
            }
        }
    }

    // Verify
    const result = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'repos' 
        AND table_schema = current_schema()
        AND (column_name LIKE '%security%' OR column_name LIKE '%scanning%' OR column_name LIKE '%dependabot%')
    `;
    logger.info(`\nFound ${result.length} security-related columns after migration`);

    if (hasFailure) {
        logger.error('Migration finished with failures.');
        process.exit(1);
    }
}

addSecurityColumnsRaw().catch(err => {
    logger.error('Unhandled error:', err);
    process.exit(1);
});
