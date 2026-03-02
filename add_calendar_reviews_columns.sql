-- Migração: adiciona colunas de aprovação/reprovação em content_calendar_items
-- Execute este script no SQL Editor do Supabase antes de usar o sistema de reviews.

ALTER TABLE content_calendar_items
  ADD COLUMN IF NOT EXISTS post_status      TEXT    NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS post_feedback    TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS stories_reviews  JSONB   NOT NULL DEFAULT '[]'::jsonb;

-- Índice para consultas por status (opcional, melhora performance em tabelas grandes)
CREATE INDEX IF NOT EXISTS idx_calendar_items_post_status
  ON content_calendar_items (post_status);
