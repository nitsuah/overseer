/**
 * Idempotent schema-evolution statements for the `repos`, `doc_status`, and
 * `tasks` tables.
 *
 * Historically every new column shipped as its own one-off script under
 * scripts/ (add-is-fork.ts, migrate-008-security.ts, quick-add-columns.ts,
 * etc.) or an unauthenticated API route (/api/add-columns). It was easy to
 * ship code that depended on a column without ever running the matching
 * script against the production database, causing "column does not exist"
 * sync failures.
 *
 * `ensureSchema()` (lib/db.ts) applies every statement here before each sync,
 * so the live schema self-heals. Append new
 * `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`
 * statements here when adding a column - do not create a new
 * scripts/migrate-*.ts file or API route.
 */
export const SCHEMA_MIGRATIONS: readonly string[] = [
    // repos: sync metadata
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS readme_last_updated TIMESTAMP WITH TIME ZONE`,

    // repos: lines-of-code metrics
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS total_loc INTEGER`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS avg_loc_per_file INTEGER`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS max_file_size INTEGER`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS loc_language_breakdown JSONB`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS token_density NUMERIC`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS comment_to_code_ratio NUMERIC`,

    // repos: test coverage
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_case_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_describe_count INTEGER DEFAULT 0`,

    // repos: CI status
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_status TEXT`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_last_run TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_workflow_name TEXT`,

    // repos: vulnerability alerts
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_alert_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_critical_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_high_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_last_checked TIMESTAMP WITH TIME ZONE`,

    // repos: contributor / velocity metrics
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS contributor_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS commit_frequency NUMERIC`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS bus_factor INTEGER`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS avg_pr_merge_time_hours NUMERIC`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS contributors_last_checked TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS open_issues_count INTEGER DEFAULT 0`,

    // repos: security configuration
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS has_security_policy BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS has_security_advisories BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS private_vuln_reporting_enabled BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS dependabot_alerts_enabled BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS dependabot_alert_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS code_scanning_enabled BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS code_scanning_alert_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS secret_scanning_enabled BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS secret_scanning_alert_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS security_last_checked TIMESTAMP WITH TIME ZONE`,

    // repos: PR readiness breakdown
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS prs_ready_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS prs_blocked_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS stale_review_count INTEGER DEFAULT 0`,
    `ALTER TABLE repos ADD COLUMN IF NOT EXISTS zombie_branch_count INTEGER DEFAULT 0`,

    // repos: identity keyed by full_name (owner/name) so repos with the same
    // short name across different owners don't share state. Drop the UNIQUE on
    // `name` (it would block inserting a second repo with a colliding short
    // name) and make `full_name` the conflict target for upserts.
    `ALTER TABLE repos DROP CONSTRAINT IF EXISTS repos_name_key`,
    `ALTER TABLE repos ADD CONSTRAINT repos_full_name_key UNIQUE (full_name)`,

    // doc_status
    `ALTER TABLE doc_status ADD COLUMN IF NOT EXISTS template_version TEXT`,
    `ALTER TABLE doc_status DROP CONSTRAINT IF EXISTS doc_status_doc_type_check`,

    // tasks
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subsection TEXT`,

    // roadmap_items: DEV-flow handoff linkage (link a roadmap item to a
    // tracked PR and/or an Agent Task Queue entry)
    `ALTER TABLE roadmap_items ADD COLUMN IF NOT EXISTS linked_pr_number INTEGER`,
    `ALTER TABLE roadmap_items ADD COLUMN IF NOT EXISTS agent_task_id TEXT`,

    // users: table + RLS (must precede any query that references this table)
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      github_id TEXT NOT NULL UNIQUE,
      github_username TEXT NOT NULL UNIQUE,
      last_sync_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `ALTER TABLE users ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE users FORCE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      CREATE POLICY allow_access_to_own_user_record ON users FOR ALL USING (github_id = current_setting('app.current_github_id', true));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$`,

    // indexes
    `CREATE INDEX IF NOT EXISTS idx_repos_health_score ON repos(health_score)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_coverage_score ON repos(coverage_score)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_last_commit ON repos(last_commit_date)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_contributor_count ON repos(contributor_count)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_security_policy ON repos(has_security_policy)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_security_last_checked ON repos(security_last_checked)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_subsection ON tasks(subsection)`,

    // agent_task_receipts: persistent log of agent task queue runs (session
    // receipts). The in-memory queue in app/api/agent/tasks/route.ts is lost on
    // restart; this table keeps a durable record of what each agent session did.
    `CREATE TABLE IF NOT EXISTS agent_task_receipts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      payload JSONB,
      meta JSONB,
      result JSONB,
      error TEXT,
      motor_pool_session_id TEXT,
      submitted_by_email TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      queued_at TIMESTAMP WITH TIME ZONE,
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_agent_task_receipts_created ON agent_task_receipts(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_agent_task_receipts_type ON agent_task_receipts(type)`,

    // repo_snapshots: time-series of per-repo signals so velocity and
    // technical-debt can be trended over rolling quarters. One row per sync.
    `CREATE TABLE IF NOT EXISTS repo_snapshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
      commit_frequency NUMERIC,
      avg_pr_merge_time_hours NUMERIC,
      health_score INTEGER,
      open_prs INTEGER,
      total_loc INTEGER,
      captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_repo_snapshots_repo_captured ON repo_snapshots(repo_id, captured_at)`,
];
