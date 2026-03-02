-- Tabela de funcionários da agência
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'editor'
    CHECK (role IN ('admin', 'editor', 'social_media', 'gestor')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage employees"
  ON employees FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public cannot access employees"
  ON employees FOR SELECT TO anon
  USING (false);

-- Índice para busca por email (usado no RBAC do AdminLayout)
CREATE INDEX IF NOT EXISTS employees_email_idx ON employees(email);
CREATE INDEX IF NOT EXISTS employees_user_id_idx ON employees(user_id);
