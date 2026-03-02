-- Adiciona colunas extras na tabela clients para o sistema unificado de clientes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS oferta TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS analise_resumo TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'starter';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT false;

-- Índice para busca por slug
CREATE INDEX IF NOT EXISTS clients_slug_idx ON clients(slug);
