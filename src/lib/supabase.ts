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

/** Instância do Supabase. Pode ser null se as variáveis de ambiente não estiverem configuradas. */
export const supabase: SupabaseClient | null = (globalThis as any).__supabaseInstance ?? null;

/**
 * Retorna a instância do Supabase garantida.
 * Use em contextos onde o Supabase é obrigatório (ex: páginas públicas de formulário).
 * @throws Error se o Supabase não estiver configurado
 */
export function getSupabase(): SupabaseClient {
    if (!supabase) throw new Error('Supabase não configurado. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
    return supabase;
}
