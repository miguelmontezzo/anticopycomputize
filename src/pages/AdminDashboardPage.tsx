import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

    const modules = [
        {
            icon: <Users className="w-5 h-5 text-accent-cyan" />,
            iconBg: 'bg-accent-cyan/10',
            border: 'hover:border-accent-cyan/50',
            title: 'Clientes Gerais',
            desc: 'Gerenciar empresas e pessoas cadastradas na plataforma.',
            link: '/admin/clients',
            linkLabel: 'Acessar Clientes',
            linkColor: 'text-accent-cyan',
        },
        {
            icon: <FolderKanban className="w-5 h-5 text-accent-cyan" />,
            iconBg: 'bg-accent-cyan/10',
            border: 'hover:border-accent-cyan/50',
            title: 'Clientes & Rotas',
            desc: 'Crie novas operações por cliente: apresentação, análise EMP e formulário.',
            link: '/admin/clientes',
            linkLabel: 'Gerenciar clientes & rotas',
            linkColor: 'text-accent-cyan',
        },
        {
            icon: <Globe className="w-5 h-5 text-accent-purple" />,
            iconBg: 'bg-accent-purple/10',
            border: 'hover:border-accent-purple/50',
            title: 'Páginas',
            desc: 'Crie landing pages dinâmicas associadas aos clientes.',
            link: '/admin/pages',
            linkLabel: 'Acessar Páginas',
            linkColor: 'text-accent-purple',
        },
        {
            icon: <ClipboardList className="w-5 h-5 text-orange-400" />,
            iconBg: 'bg-orange-500/10',
            border: 'hover:border-orange-500/50',
            title: 'Formulários & Leads',
            desc: 'Construa formulários dinâmicos e capture as respostas de clientes.',
            link: '/admin/forms',
            linkLabel: 'Acessar Formulários',
            linkColor: 'text-orange-400',
        },
        {
            icon: <FileText className="w-5 h-5 text-accent-cyan" />,
            iconBg: 'bg-accent-cyan/10',
            border: 'hover:border-accent-cyan/50',
            title: 'Estratégia EMP',
            desc: 'Respostas, capturas de logins e anexos do Diagnóstico Estratégico.',
            link: '/admin/emp',
            linkLabel: 'Acessar respostas',
            linkColor: 'text-accent-cyan',
        },
        {
            icon: <CalendarDays className="w-5 h-5 text-accent-cyan" />,
            iconBg: 'bg-accent-cyan/10',
            border: 'hover:border-accent-cyan/50',
            title: 'Calendário de Conteúdo',
            desc: 'Gerencie e aprove o calendário semanal post a post.',
            link: '/admin/calendarios',
            linkLabel: 'Gerenciar calendários',
            linkColor: 'text-accent-cyan',
        },
    ];

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
                    {modules.map((mod) => (
                        <div key={mod.link} className={`bg-black/40 border border-white/10 ${mod.border} transition-colors p-8 rounded-2xl flex flex-col gap-4`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${mod.iconBg} flex items-center justify-center`}>
                                    {mod.icon}
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">{mod.title}</h3>
                            </div>
                            <p className="text-sm text-muted font-light leading-relaxed">
                                {mod.desc}
                            </p>
                            <Link
                                to={mod.link}
                                className={`mt-auto inline-flex items-center ${mod.linkColor} text-sm font-medium hover:text-white transition-colors`}
                            >
                                {mod.linkLabel} →
                            </Link>
                        </div>
                    ))}
                </div>
            </FadeIn>
        </div>
    );
}
