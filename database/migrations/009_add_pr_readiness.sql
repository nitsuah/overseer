-- Migration: Add PR readiness breakdown columns
-- Date: 2026-06-11
-- Description: Track open PR counts broken down by review/CI readiness
-- (ready-to-merge vs blocked on review changes, CI failures, or conflicts)

ALTER TABLE repos ADD COLUMN IF NOT EXISTS prs_ready_count INTEGER DEFAULT 0;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS prs_blocked_count INTEGER DEFAULT 0;
