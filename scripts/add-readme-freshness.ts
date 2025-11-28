import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';
import logger from '../lib/log';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function addReadmeFreshnessColumn() {
    logger.info('Adding readme_last_updated column to repos table...');

    try {
        await sql`
      ALTER TABLE repos 
      ADD COLUMN IF NOT EXISTS readme_last_updated TIMESTAMP
    `;

        logger.info('✅ Successfully added readme_last_updated column');
    } catch (error) {
        logger.warn('❌ Error adding column:', error);
        throw error;
    }
}

addReadmeFreshnessColumn()
    .then(() => {
        logger.info('Migration complete!');
        process.exit(0);
    })
    .catch((error) => {
        logger.warn('Migration failed:', error);
        process.exit(1);
    });
