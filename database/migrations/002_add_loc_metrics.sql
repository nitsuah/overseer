-- Add LOC (Lines of Code) metrics to repos table
ALTER TABLE repos ADD COLUMN IF NOT EXISTS total_loc INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS avg_loc_per_file INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS max_file_size INTEGER;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS loc_language_breakdown JSONB;
