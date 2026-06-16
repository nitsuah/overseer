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

    // doc_status
    `ALTER TABLE doc_status ADD COLUMN IF NOT EXISTS template_version TEXT`,
    `ALTER TABLE doc_status DROP CONSTRAINT IF EXISTS doc_status_doc_type_check`,

    // tasks
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subsection TEXT`,

    // indexes
    `CREATE INDEX IF NOT EXISTS idx_repos_health_score ON repos(health_score)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_coverage_score ON repos(coverage_score)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_last_commit ON repos(last_commit_date)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_contributor_count ON repos(contributor_count)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_security_policy ON repos(has_security_policy)`,
    `CREATE INDEX IF NOT EXISTS idx_repos_security_last_checked ON repos(security_last_checked)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_subsection ON tasks(subsection)`,
];
