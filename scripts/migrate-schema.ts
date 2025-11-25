import { getNeonClient } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function migrateSchema() {
    const db = getNeonClient();
    
    console.log('Starting schema migration...');
    
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
                console.log('✓ Executed statement');
            } catch (error) {
                // Ignore errors for CREATE TABLE IF NOT EXISTS, etc.
                if (error instanceof Error && !error.message.includes('already exists')) {
                    console.error('Error executing statement:', error.message);
                    console.error('Statement:', statement.substring(0, 100));
                }
            }
        }
        
        console.log('✓ Schema migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateSchema();
