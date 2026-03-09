-- Migration 003: Add 'atendimento' to employee role enum
-- And add whatsapp field to employees and clients

-- Add atendimento to the role check constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check;
ALTER TABLE employees ADD CONSTRAINT employees_role_check
  CHECK (role IN ('admin', 'gestor', 'atendimento', 'editor', 'social_media'));

-- Add whatsapp column to employees (for WhatsApp notifications)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

-- Add whatsapp column to clients (for WhatsApp notifications)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

-- Task time logs table (optional, for detailed tracking)
CREATE TABLE IF NOT EXISTS task_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE WHEN ended_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
      ELSE NULL
    END
  ) STORED
);

ALTER TABLE task_time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can manage time logs"
  ON task_time_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS task_time_logs_task_id_idx ON task_time_logs(task_id);
CREATE INDEX IF NOT EXISTS task_time_logs_employee_id_idx ON task_time_logs(employee_id);
