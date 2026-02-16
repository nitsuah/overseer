-- Migration: Add security configuration tracking columns
-- Date: 2026-02-15
-- Description: Add columns to track GitHub security policy presence and configuration

ALTER TABLE repos ADD COLUMN IF NOT EXISTS has_security_policy BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS has_security_advisories BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS private_vuln_reporting_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS dependabot_alerts_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS code_scanning_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS code_scanning_alert_count INTEGER DEFAULT 0;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS secret_scanning_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS secret_scanning_alert_count INTEGER DEFAULT 0;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS security_last_checked TIMESTAMP WITH TIME ZONE;

-- Add index for querying security status
CREATE INDEX IF NOT EXISTS idx_repos_security_policy ON repos(has_security_policy);
CREATE INDEX IF NOT EXISTS idx_repos_security_last_checked ON repos(security_last_checked);
