// Script to apply missing columns migration to the database

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  const sql = neon(databaseUrl);

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', '002_add_missing_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📝 Running migration: 002_add_missing_columns.sql');
    
    // Split migration into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    let successCount = 0;
    for (const statement of statements) {
      if (statement) {
        try {
          // Use neon's transaction method with raw SQL
          await sql.transaction([
            sql([statement] as unknown as TemplateStringsArray)
          ]);
          successCount++;
        } catch (err: unknown) {
          // Ignore "already exists" errors
          const error = err as Error;
          if (!error.message?.includes('already exists')) {
            console.warn(`⚠️  Statement warning: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ Migration completed successfully! (${successCount} statements executed)`);
    console.log('\nAdded columns:');
    console.log('  - readme_last_updated');
    console.log('  - total_loc');
    console.log('  - loc_language_breakdown');
    console.log('  - test_case_count');
    console.log('  - test_describe_count');
    console.log('  - ci_status, ci_last_run, ci_workflow_name');
    console.log('  - vuln_alert_count, vuln_critical_count, vuln_high_count, vuln_last_checked');
    console.log('  - contributor_count, commit_frequency, bus_factor, avg_pr_merge_time_hours');
    console.log('  - open_issues_count');

    // Verify the columns exist
    console.log('\n🔍 Verifying schema...');
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'repos' 
        AND column_name IN (
          'total_loc', 'loc_language_breakdown', 'test_case_count', 
          'ci_status', 'vuln_alert_count', 'contributor_count', 
          'readme_last_updated', 'open_issues_count'
        )
      ORDER BY column_name;
    `;

    console.log(`Found ${result.length} new columns:`);
    result.forEach(col => {
      console.log(`  ✓ ${col.column_name} (${col.data_type})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
