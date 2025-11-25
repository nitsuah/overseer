import { config } from 'dotenv';
import { getNeonClient } from '../lib/db';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

async function addMissingColumns() {
    const db = getNeonClient();
    
    console.log('Adding missing columns to existing tables...');
    
    try {
        // Read migration file
        const migrationPath = path.join(process.cwd(), 'database', 'add_missing_columns.sql');
        const migration = fs.readFileSync(migrationPath, 'utf-8');
        
        // Split by semicolon and execute each statement
        const statements = migration
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
            try {
                await db.unsafe(statement);
                console.log('✓ Executed statement');
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error executing statement:', error.message);
                }
            }
        }
        
        console.log('✓ Column migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

addMissingColumns();
