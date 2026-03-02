import React, { useEffect, useState } from 'react';
import { FadeIn } from '../components/Shared';
import { supabase } from '../lib/supabase';
import { Users, Globe, ClipboardList, FolderKanban, FileText, CalendarDays } from 'lucide-react';

export default function AdminDashboardPage() {
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const getUser = async () => {
            if (!supabase) return;
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
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-accent-cyan" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Clientes Getais</h3>
                        </div>
                        <p className="text-sm text-muted font-light leading-relaxed">
                            Gerenciar empresas e pessoas cadastradas na plataforma.
                        </p>
                        <a
                            href="/admin/clients"
                            className="mt-auto inline-flex items-center text-accent-cyan text-sm font-medium hover:text-white transition-colors"
                        >
                            Acessar Clientes →
                        </a>
                    </div>

                    <div className="bg-black/40 border border-white/10 hover:border-accent-cyan/50 transition-colors p-8 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                                <FolderKanban className="w-5 h-5 text-accent-cyan" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Clientes & Rotas</h3>
                        </div>
                        <p className="text-sm text-muted font-light leading-relaxed">
                            Crie novas operações por cliente: apresentação, análise EMP e formulário.
                        </p>
                        <a href="/admin/clientes" className="mt-auto inline-flex items-center text-accent-cyan text-sm font-medium hover:text-white transition-colors">
                            Gerenciar clientes & rotas →
                        </a>
                    </div>

                    <div className="bg-black/40 border border-white/10 hover:border-accent-purple/50 transition-colors p-8 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-accent-purple" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Páginas</h3>
                        </div>
                        <p className="text-sm text-muted font-light leading-relaxed">
                            Crie landing pages dinâmicas associadas aos clientes.
                        </p>
                        <a
                            href="/admin/pages"
                            className="mt-auto inline-flex items-center text-accent-purple text-sm font-medium hover:text-white transition-colors"
                        >
                            Acessar Páginas →
                        </a>
                    </div>

                    <div className="bg-black/40 border border-white/10 hover:border-orange-500/50 transition-colors p-8 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Formulários & Leads</h3>
                        </div>
                        <p className="text-sm text-muted font-light leading-relaxed">
                            Construa formulários dinâmicos e capture as respostas de clientes.
                        </p>
                        <a
                            href="/admin/forms"
                            className="mt-auto inline-flex items-center text-orange-400 text-sm font-medium hover:text-white transition-colors"
                        >
                            Acessar Formulários →
                        </a>
                    </div>

                    <div className="bg-black/40 border border-white/10 hover:border-accent-cyan/50 transition-colors p-8 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-accent-cyan" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Estratégia EMP</h3>
                        </div>
                        <p className="text-sm text-muted font-light leading-relaxed">
                            Respostas, capturas de logins e anexos do Diagnóstico Estratégico.
                        </p>
                        <a href="/admin/emp" className="mt-auto inline-flex items-center text-accent-cyan text-sm font-medium hover:text-white transition-colors">
                            Acessar respostas →
                        </a>
                    </div>

                    <div className="bg-black/40 border border-white/10 hover:border-accent-cyan/50 transition-colors p-8 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                                <CalendarDays className="w-5 h-5 text-accent-cyan" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Calendário Computo</h3>
                        </div>
                        <p className="text-sm text-muted font-light leading-relaxed">
                            Acesse rápido o calendário semanal e valide post a post com aprovado/reprovado.
                        </p>
                        <a href="/computo/calendario" className="mt-auto inline-flex items-center text-accent-cyan text-sm font-medium hover:text-white transition-colors">
                            Abrir calendário →
                        </a>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
