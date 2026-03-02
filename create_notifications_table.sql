-- Tabela de notificações do portal do cliente
-- Usada pela agência para comunicar com o cliente (novo calendário, atualizações, etc.)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  -- tipos: 'new_calendar', 'calendar_updated', 'post_approved', 'info'
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage notifications"
  ON notifications FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS notifications_client_id_idx ON notifications(client_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
