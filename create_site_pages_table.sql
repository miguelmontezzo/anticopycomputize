-- Tabela para gerenciamento de conteúdo das páginas do site (CMS lite)
CREATE TABLE IF NOT EXISTS site_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,  -- 'computize', 'ia-service', 'metodo-emp'
  title TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: apenas usuários autenticados podem editar
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on site_pages"
  ON site_pages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active site_pages"
  ON site_pages
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Seed: 3 páginas iniciais
INSERT INTO site_pages (slug, title) VALUES
  ('computize', 'Computize — Landing Page'),
  ('ia-service', 'IA Service'),
  ('metodo-emp', 'Método EMP')
ON CONFLICT (slug) DO NOTHING;
