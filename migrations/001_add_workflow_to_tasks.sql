-- Migration 001: Add workflow columns to tasks table
-- Run this in Supabase SQL Editor

-- Add workflow_status column
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(30) DEFAULT 'demand'
  CHECK (workflow_status IN (
    'demand', 'strategy', 'internal_review', 'client_review',
    'production', 'internal_approval', 'client_approval',
    'ready_to_post', 'published', 'rejected'
  ));

-- Add project_id FK (projects table must exist first — run migration 002)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Briefing fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS briefing TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS format_type VARCHAR(30);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reference_links TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(20) DEFAULT 'content';

-- Time tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;

-- Migrate existing status to workflow_status
UPDATE tasks SET workflow_status = CASE
  WHEN status = 'done' THEN 'published'
  WHEN status = 'in_progress' THEN 'production'
  ELSE 'demand'
END WHERE workflow_status IS NULL OR workflow_status = 'demand';

-- Index for performance
CREATE INDEX IF NOT EXISTS tasks_workflow_status_idx ON tasks(workflow_status);
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
