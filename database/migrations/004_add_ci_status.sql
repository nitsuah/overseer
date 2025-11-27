-- Add CI/CD status columns to repos table
ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_status TEXT; -- 'passing', 'failing', 'unknown'
ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_last_run TIMESTAMP WITH TIME ZONE;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS ci_workflow_name TEXT;
