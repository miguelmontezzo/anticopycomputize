CREATE TABLE IF NOT EXISTS public.cadastros_guiaclaude (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.cadastros_guiaclaude ENABLE ROW LEVEL SECURITY;

-- Apagar as políticas que limitavam apenas a "anon" antes (se existirem)
DROP POLICY IF EXISTS "Allow anon insert" ON public.cadastros_guiaclaude;
DROP POLICY IF EXISTS "Allow anon select" ON public.cadastros_guiaclaude;

-- Criar políticas 100% permissivas para público em geral (sem necessidade de login)
CREATE POLICY "Allow public insert" ON public.cadastros_guiaclaude FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.cadastros_guiaclaude FOR SELECT TO public USING (true);
