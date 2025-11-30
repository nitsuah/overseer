-- Add subsection column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subsection TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_subsection ON tasks(subsection);
