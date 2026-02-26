-- PARTE 1: Atualizar a tabela de respostas (Execute se ainda não fez)
ALTER TABLE emp_responses
ADD COLUMN IF NOT EXISTS instagram_user TEXT,
ADD COLUMN IF NOT EXISTS instagram_pass TEXT,
ADD COLUMN IF NOT EXISTS documentos_urls JSONB;

-- PARTE 2: Liberação de Segurança (RLS) para o Bucket "anticopyai"
-- Isso permite que usuários sem login (anônimos) consigam enviar arquivos para a pasta 'uploads'

-- 1. Certifique-se de que o bucket foi criado recebendo o nome "anticopyai" na aba Storage do Supabase (e marque "Public").
-- Caso não tenha criado pela interface, siga essa linha:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('anticopyai', 'anticopyai', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permite o Upload de Arquivos (INSERT)
CREATE POLICY "Permitir Uploads Publicos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'anticopyai');

-- 3. Permite a Leitura de Arquivos (SELECT)
CREATE POLICY "Permitir Leitura Publica"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'anticopyai');
