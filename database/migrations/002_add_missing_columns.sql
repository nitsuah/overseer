-- Migration: Add missing columns to repos table
-- This adds columns for Phase 5 (Contributor Metrics) and other missing fields

-- Add README last updated tracking
ALTER TABLE repos ADD COLUMN IF NOT EXISTS readme_last_updated TIMESTAMP WITH TIME ZONE;

-- Add Lines of Code (LOC) metrics
ALTER TABLE repos ADD COLUMN IF NOT EXISTS total_loc INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS loc_language_breakdown JSONB;

-- Add test metrics
ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_case_count INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_describe_count INTEGER;

-- Add CI/CD status
ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_status TEXT;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_last_run TIMESTAMP WITH TIME ZONE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_workflow_name TEXT;

-- Add vulnerability metrics
ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_alert_count INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_critical_count INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_high_count INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS vuln_last_checked TIMESTAMP WITH TIME ZONE;

-- Add contributor metrics (Phase 5)
ALTER TABLE repos ADD COLUMN IF NOT EXISTS contributor_count INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS commit_frequency NUMERIC; -- commits per week
ALTER TABLE repos ADD COLUMN IF NOT EXISTS bus_factor INTEGER; -- number of contributors with >50% knowledge
ALTER TABLE repos ADD COLUMN IF NOT EXISTS avg_pr_merge_time_hours NUMERIC;

-- Add open issues count (separate from open_prs)
ALTER TABLE repos ADD COLUMN IF NOT EXISTS open_issues_count INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repos_health_score ON repos(health_score);
CREATE INDEX IF NOT EXISTS idx_repos_coverage_score ON repos(coverage_score);
CREATE INDEX IF NOT EXISTS idx_repos_last_commit ON repos(last_commit_date);
CREATE INDEX IF NOT EXISTS idx_repos_contributor_count ON repos(contributor_count);

-- Update existing rows to have sensible defaults
UPDATE repos SET 
  total_loc = 0 WHERE total_loc IS NULL;
UPDATE repos SET 
  test_case_count = 0 WHERE test_case_count IS NULL;
UPDATE repos SET 
  vuln_alert_count = 0 WHERE vuln_alert_count IS NULL;
UPDATE repos SET 
  vuln_critical_count = 0 WHERE vuln_critical_count IS NULL;
UPDATE repos SET 
  vuln_high_count = 0 WHERE vuln_high_count IS NULL;
UPDATE repos SET 
  contributor_count = 1 WHERE contributor_count IS NULL;
UPDATE repos SET 
  open_issues_count = open_issues WHERE open_issues_count IS NULL;

COMMENT ON COLUMN repos.total_loc IS 'Total lines of code across all languages';
COMMENT ON COLUMN repos.loc_language_breakdown IS 'JSON object mapping language names to LOC counts';
COMMENT ON COLUMN repos.test_case_count IS 'Number of test cases (it/test blocks)';
COMMENT ON COLUMN repos.test_describe_count IS 'Number of test describe/suite blocks';
COMMENT ON COLUMN repos.ci_status IS 'Current CI/CD status: passing, failing, etc.';
COMMENT ON COLUMN repos.contributor_count IS 'Number of unique contributors to the repository';
COMMENT ON COLUMN repos.commit_frequency IS 'Average number of commits per week';
COMMENT ON COLUMN repos.bus_factor IS 'Number of contributors who hold majority of knowledge';
COMMENT ON COLUMN repos.avg_pr_merge_time_hours IS 'Average time in hours to merge a pull request';
