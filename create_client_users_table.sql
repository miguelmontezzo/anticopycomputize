-- Tabela de usuários do portal do cliente
-- Liga um auth.user a um client (permite que clientes façam login no portal)
CREATE TABLE IF NOT EXISTS client_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- cada usuário só pode ser vinculado a um cliente
);

-- RLS
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado pode ler apenas o próprio registro
CREATE POLICY "Users can read own client_user"
  ON client_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Usuário só pode criar vínculo com seu próprio user_id (auto-link no primeiro login)
CREATE POLICY "Users can insert own client_user"
  ON client_users FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuário pode deletar apenas o próprio vínculo (logout/unlink)
CREATE POLICY "Users can delete own client_user"
  ON client_users FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Service role (Supabase functions / admin backend) pode gerenciar todos os vínculos
-- Isso é aplicado automaticamente para a service_role key, sem precisar de policy explícita.

-- Índices
CREATE INDEX IF NOT EXISTS client_users_user_id_idx ON client_users(user_id);
CREATE INDEX IF NOT EXISTS client_users_client_id_idx ON client_users(client_id);

