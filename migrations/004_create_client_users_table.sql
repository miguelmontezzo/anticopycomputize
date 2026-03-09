-- Migration 004: Create client_users table
-- This table links Supabase auth users to clients for portal access

CREATE TABLE IF NOT EXISTS client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)  -- one user per client only
);

-- RLS
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own record
CREATE POLICY "Users can read own client link"
  ON client_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service role / authenticated to insert
CREATE POLICY "Authenticated can insert client links"
  ON client_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS client_users_user_id_idx ON client_users(user_id);
CREATE INDEX IF NOT EXISTS client_users_client_id_idx ON client_users(client_id);
