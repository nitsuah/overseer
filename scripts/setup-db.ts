/* eslint-disable @typescript-eslint/no-explicit-any */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import logger from '../lib/log';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function setupDatabase() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        logger.warn('❌ DATABASE_URL not configured in environment variables');
        logger.info('Please add DATABASE_URL to your .env.local file');
        process.exit(1);
    }

    logger.info('📦 Setting up database schema...');

    const db = neon(databaseUrl);

    try {
        // Read the schema file
        const schemaPath = join(process.cwd(), 'database', 'schema.sql');
        let schema = readFileSync(schemaPath, 'utf-8');

        // Remove comments
        schema = schema.replace(/--.*$/gm, '');

        // Split by semicolons, but keep multi-line statements together
        const statements: string[] = [];
        let currentStatement = '';

        for (const line of schema.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('--')) continue;

            currentStatement += ' ' + trimmed;

            if (trimmed.endsWith(';')) {
                const statement = currentStatement.trim().replace(/;$/, '').trim();
                if (statement.length > 0) {
                    statements.push(statement);
                }
                currentStatement = '';
            }
        }

        // Add any remaining statement
        if (currentStatement.trim().length > 0) {
            statements.push(currentStatement.trim());
        }

        // Filter out RLS and policy statements
        const filteredStatements = statements
            .filter(s => !s.includes('ENABLE ROW LEVEL SECURITY'))
            .filter(s => !s.includes('CREATE POLICY'))
            .filter(s => !s.includes('ALTER TABLE'));

        // Separate CREATE TABLE and CREATE INDEX statements
        const tableStatements = filteredStatements.filter(s => s.toUpperCase().startsWith('CREATE TABLE'));
        const indexStatements = filteredStatements.filter(s => s.toUpperCase().startsWith('CREATE INDEX'));

    logger.info(`Found ${tableStatements.length} table statements and ${indexStatements.length} index statements`);

        // Execute table creation first
        for (const statement of tableStatements) {
            try {
                const sql = db as any;
                await sql.query(statement);
                // Extract table name - handle "CREATE TABLE IF NOT EXISTS table_name" or "CREATE TABLE table_name"
                const tableName = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || 'unknown';
                logger.info(`✓ Created table: ${tableName}`);
            } catch (error: any) {
                if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
                    logger.warn(`❌ Error creating table: ${error.message}`);
                    logger.debug(`   Statement: ${statement.substring(0, 150)}...`);
                } else {
                    const tableName = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || 'unknown';
                    logger.info(`✓ Table already exists: ${tableName}`);
                }
            }
        }

        // Then execute index creation
        for (const statement of indexStatements) {
            try {
                const sql = db as any;
                await sql.query(statement);
                const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1] || 'unknown';
                logger.info(`✓ Created index: ${indexName}`);
            } catch (error: any) {
                if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
                    logger.warn(`⚠️  Warning creating index: ${error.message}`);
                } else {
                    const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1] || 'unknown';
                    logger.info(`✓ Index already exists: ${indexName}`);
                }
            }
        }

        logger.info('✅ Database schema created successfully!');
        logger.info('\nYou can now sync your repos from the dashboard.');
    } catch (error: any) {
        logger.warn('❌ Error setting up database:', error.message);
        process.exit(1);
    }
}

setupDatabase();

