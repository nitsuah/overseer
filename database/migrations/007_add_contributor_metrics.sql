-- Add contributor analytics columns to repos table
ALTER TABLE repos ADD COLUMN IF NOT EXISTS contributor_count INTEGER DEFAULT 0;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS commit_frequency NUMERIC; -- commits per week
ALTER TABLE repos ADD COLUMN IF NOT EXISTS bus_factor INTEGER; -- contributor concentration
ALTER TABLE repos ADD COLUMN IF NOT EXISTS avg_pr_merge_time_hours NUMERIC;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS contributors_last_checked TIMESTAMP WITH TIME ZONE;
