import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Lock, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!supabase) {
            setError('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local.');
            setLoading(false);
            return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            setError(authError.message === 'Invalid login credentials' ? 'Credenciais inválidas. Tente novamente.' : authError.message);
            setLoading(false);
        } else {
            // Login bem sucedido, o AdminLayout detectará a mudança de sessão e fará os acessos
            navigate('/admin');
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] glow-purple opacity-20" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] glow-cyan opacity-20" />
            </div>

            <FadeIn className="w-full max-w-md relative z-10 block">
                <div className="bg-black/40 p-8 md:p-12 flex flex-col gap-8 rounded-2xl border border-white/10 w-full shadow-2xl backdrop-blur-sm">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-6 h-6 text-accent-cyan" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter mb-2">Acesso Restrito</h1>
                        <p className="text-muted text-sm font-light">Painel Administrativo da Computize</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        {!supabase && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-4 py-3 rounded-lg text-center font-medium">
                                Ambiente sem Supabase. Configure o .env.local para habilitar login.
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-widest uppercase text-muted font-bold">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 transition-all text-white placeholder:text-white/20"
                                placeholder="admin@computize.com"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-widest uppercase text-muted font-bold">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 transition-all text-white placeholder:text-white/20"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 bg-white text-black font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Entrando...' : (
                                <>Entrar <LogIn className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </FadeIn>
        </div>
    );
}
