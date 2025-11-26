import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
    }

    const sql = neon(databaseUrl);
    
    const results = [];
    
    // Execute each ALTER TABLE statement
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS readme_last_updated TIMESTAMP WITH TIME ZONE`;
      results.push({ column: 'readme_last_updated', status: 'success' });
    } catch (e) { results.push({ column: 'readme_last_updated', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS total_loc INTEGER`;
      results.push({ column: 'total_loc', status: 'success' });
    } catch (e) { results.push({ column: 'total_loc', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS loc_language_breakdown JSONB`;
      results.push({ column: 'loc_language_breakdown', status: 'success' });
    } catch (e) { results.push({ column: 'loc_language_breakdown', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_case_count INTEGER`;
      results.push({ column: 'test_case_count', status: 'success' });
    } catch (e) { results.push({ column: 'test_case_count', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_describe_count INTEGER`;
      results.push({ column: 'test_describe_count', status: 'success' });
    } catch (e) { results.push({ column: 'test_describe_count', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_status TEXT`;
      results.push({ column: 'ci_status', status: 'success' });
    } catch (e) { results.push({ column: 'ci_status', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_last_run TIMESTAMP WITH TIME ZONE`;
      results.push({ column: 'ci_last_run', status: 'success' });
    } catch (e) { results.push({ column: 'ci_last_run', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_workflow_name TEXT`;
      results.push({ column: 'ci_workflow_name', status: 'success' });
    } catch (e) { results.push({ column: 'ci_workflow_name', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_alert_count INTEGER`;
      results.push({ column: 'vuln_alert_count', status: 'success' });
    } catch (e) { results.push({ column: 'vuln_alert_count', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_critical_count INTEGER`;
      results.push({ column: 'vuln_critical_count', status: 'success' });
    } catch (e) { results.push({ column: 'vuln_critical_count', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_high_count INTEGER`;
      results.push({ column: 'vuln_high_count', status: 'success' });
    } catch (e) { results.push({ column: 'vuln_high_count', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_last_checked TIMESTAMP WITH TIME ZONE`;
      results.push({ column: 'vuln_last_checked', status: 'success' });
    } catch (e) { results.push({ column: 'vuln_last_checked', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS contributor_count INTEGER`;
      results.push({ column: 'contributor_count', status: 'success' });
    } catch (e) { results.push({ column: 'contributor_count', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS commit_frequency NUMERIC`;
      results.push({ column: 'commit_frequency', status: 'success' });
    } catch (e) { results.push({ column: 'commit_frequency', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS bus_factor INTEGER`;
      results.push({ column: 'bus_factor', status: 'success' });
    } catch (e) { results.push({ column: 'bus_factor', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS avg_pr_merge_time_hours NUMERIC`;
      results.push({ column: 'avg_pr_merge_time_hours', status: 'success' });
    } catch (e) { results.push({ column: 'avg_pr_merge_time_hours', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS open_issues_count INTEGER`;
      results.push({ column: 'open_issues_count', status: 'success' });
    } catch (e) { results.push({ column: 'open_issues_count', status: 'error', message: (e as Error).message }); }
    
    try {
      await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS contributors_last_checked TIMESTAMP WITH TIME ZONE`;
      results.push({ column: 'contributors_last_checked', status: 'success' });
    } catch (e) { results.push({ column: 'contributors_last_checked', status: 'error', message: (e as Error).message }); }
    
    // Add missing doc_status columns
    try {
      await sql`ALTER TABLE doc_status ADD COLUMN IF NOT EXISTS template_version TEXT`;
      results.push({ column: 'template_version (doc_status)', status: 'success' });
    } catch (e) { results.push({ column: 'template_version (doc_status)', status: 'error', message: (e as Error).message }); }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to add columns', details: (error as Error).message },
      { status: 500 }
    );
  }
}
