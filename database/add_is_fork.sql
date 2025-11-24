-- Add is_fork column to repos table
ALTER TABLE repos ADD COLUMN IF NOT EXISTS is_fork BOOLEAN DEFAULT FALSE;

