import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL ou Anon Key ausentes nas variáveis de ambiente. Verifique o arquivo .env ou a configuração da Vercel.');
}

// Previne o aviso "Multiple GoTrueClient" no ambiente de desenvolvimento
if (!(globalThis as any).__supabaseInstance && supabaseUrl && supabaseAnonKey) {
    (globalThis as any).__supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase: SupabaseClient = (globalThis as any).__supabaseInstance || null;
