-- Add test case tracking columns to repos table
ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_case_count INTEGER DEFAULT 0;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS test_describe_count INTEGER DEFAULT 0;
