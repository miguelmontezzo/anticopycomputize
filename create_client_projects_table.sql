-- Tabela para gerar operações multi-cliente (apresentação + análise + EMP)
create table if not exists public.client_projects (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  oferta text,
  analise_resumo text,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

-- Campo para vincular respostas EMP ao cliente
alter table public.emp_responses
  add column if not exists client_slug text default 'computize';

create index if not exists idx_emp_responses_client_slug on public.emp_responses(client_slug);

-- RLS básica (ajuste conforme sua política de segurança)
alter table public.client_projects enable row level security;

create policy if not exists "client_projects_read_authenticated"
on public.client_projects for select
using (auth.role() = 'authenticated');

create policy if not exists "client_projects_insert_authenticated"
on public.client_projects for insert
with check (auth.role() = 'authenticated');
