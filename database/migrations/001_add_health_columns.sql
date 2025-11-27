-- Add health_state column to doc_status table if it doesn't exist
ALTER TABLE doc_status 
ADD COLUMN IF NOT EXISTS health_state TEXT 
CHECK (health_state IN ('missing', 'dormant', 'malformed', 'healthy')) 
DEFAULT 'missing';

-- Add health_score column to repos table if it doesn't exist  
ALTER TABLE repos
ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 0;

-- Add testing columns to repos table if they don't exist
ALTER TABLE repos
ADD COLUMN IF NOT EXISTS testing_status TEXT;

ALTER TABLE repos
ADD COLUMN IF NOT EXISTS coverage_score NUMERIC;

-- Add index for health_state if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_doc_status_health ON doc_status(health_state);
