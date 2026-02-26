import React, { useEffect, useState } from 'react';
import { FadeIn } from '../components/Shared';
import { supabase } from '../lib/supabase';

export default function AdminDashboardPage() {
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserEmail(user.email);
            }
        };
        getUser();
    }, []);

    return (
        <div className="p-6 md:p-12">
            <header className="mb-12 border-b border-white/10 pb-6">
                <FadeIn>
                    <h1 className="text-4xl font-bold tracking-tighter mb-2">Painel de Controle</h1>
                    <p className="text-muted font-light">
                        Bem-vindo(a) de volta, <span className="text-white font-medium">{userEmail || 'Administrador'}</span>.
                    </p>
                </FadeIn>
            </header>

            <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-black/40 border border-white/10 hover:border-accent-cyan/50 transition-colors p-8 rounded-2xl flex flex-col gap-4">
                        <h3 className="text-xl font-bold tracking-tight">Estratégia EMP</h3>
                        <p className="text-sm text-muted font-light leading-relaxed">
                            Respostas, capturas de logins e anexos do Diagnóstico Estratégico.
                        </p>
                        <a
                            href="/admin/emp"
                            className="mt-auto inline-flex items-center text-accent-cyan text-sm font-medium hover:text-white transition-colors"
                        >
                            Acessar Ferramenta →
                        </a>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
