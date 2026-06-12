// Brings an existing database up to date with the latest schema.
// Safe to run repeatedly - every statement is idempotent.
//
// New tables: edit database/schema.sql (also run by `npm run setup-db`).
// New columns/indexes on existing tables: append to lib/schema-migrations.ts.
import { config } from 'dotenv';
import { getNeonClient, ensureSchema } from '../lib/db';
import { SCHEMA_MIGRATIONS } from '../lib/schema-migrations';
import logger from '../lib/log';

config({ path: '.env.local' });

async function main() {
    const db = getNeonClient();
    await ensureSchema(db);
    logger.info(`Applied ${SCHEMA_MIGRATIONS.length} schema migration statements.`);
    logger.info('Database schema is up to date.');
}

main().catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
});
