// Quick migration script - run individual ALTER TABLE statements

import { getNeonClient } from '../lib/db';
import * as dotenv from 'dotenv';
import logger from '../lib/log';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function addMissingColumns() {
  const sql = getNeonClient();

  const columns = [
    { name: 'readme_last_updated', type: 'TIMESTAMP WITH TIME ZONE' },
    { name: 'total_loc', type: 'INTEGER' },
    { name: 'loc_language_breakdown', type: 'JSONB' },
    { name: 'test_case_count', type: 'INTEGER' },
    { name: 'test_describe_count', type: 'INTEGER' },
    { name: 'ci_status', type: 'TEXT' },
    { name: 'ci_last_run', type: 'TIMESTAMP WITH TIME ZONE' },
    { name: 'ci_workflow_name', type: 'TEXT' },
    { name: 'vuln_alert_count', type: 'INTEGER' },
    { name: 'vuln_critical_count', type: 'INTEGER' },
    { name: 'vuln_high_count', type: 'INTEGER' },
    { name: 'vuln_last_checked', type: 'TIMESTAMP WITH TIME ZONE' },
    { name: 'contributor_count', type: 'INTEGER' },
    { name: 'commit_frequency', type: 'NUMERIC' },
    { name: 'bus_factor', type: 'INTEGER' },
    { name: 'avg_pr_merge_time_hours', type: 'NUMERIC' },
    { name: 'open_issues_count', type: 'INTEGER' },
  ];

  logger.info('🔌 Adding missing columns to repos table...\n');

  for (const col of columns) {
    try {
      // Neon requires raw SQL for ALTER TABLE with dynamic types
      const query = `ALTER TABLE repos ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
      await sql([query] as unknown as TemplateStringsArray);
      logger.info(`✅ Added column: ${col.name} (${col.type})`);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('already exists')) {
        logger.info(`ℹ️  Column ${col.name} already exists`);
      } else {
        logger.warn(`❌ Failed to add ${col.name}:`, err.message);
      }
    }
  }
  logger.info('\n🎉 Migration complete!');
}
addMissingColumns().catch((e) => logger.warn(e));
