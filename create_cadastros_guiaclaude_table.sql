CREATE TABLE IF NOT EXISTS public.cadastros_guiaclaude (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.cadastros_guiaclaude ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários anônimos (qualquer um) insira dados (para o formulário de cadastro)
CREATE POLICY "Allow anon insert" ON public.cadastros_guiaclaude FOR INSERT TO anon WITH CHECK (true);

-- Permitir que usuários anônimos pesquisem pelo email (para verificar se o cadastro já existe sem necessidade de senha)
CREATE POLICY "Allow anon select" ON public.cadastros_guiaclaude FOR SELECT TO anon USING (true);
