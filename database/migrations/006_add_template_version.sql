-- Add template version tracking to doc_status
ALTER TABLE doc_status ADD COLUMN IF NOT EXISTS template_version TEXT;
