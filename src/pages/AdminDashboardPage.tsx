import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Globe, ClipboardList, FileText, CalendarDays, Layers, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

export default function AdminDashboardPage() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    getUser();
  }, []);

  const firstName = userEmail.split('@')[0] || 'Admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const modules = [
    {
      icon: <Users className="w-4 h-4" />,
      title: 'Clientes',
      desc: 'Gerenciar empresas e pessoas atendidas.',
      link: '/admin/clients',
      linkLabel: 'Acessar',
    },
    {
      icon: <Layers className="w-4 h-4" />,
      title: 'Projetos & Rotas',
      desc: 'Apresentações, análises EMP e links por cliente.',
      link: '/admin/clientes',
      linkLabel: 'Acessar',
    },
    {
      icon: <CalendarDays className="w-4 h-4" />,
      title: 'Calendários',
      desc: 'Gerencie e edite calendários de conteúdo.',
      link: '/admin/calendarios',
      linkLabel: 'Acessar',
    },
    {
      icon: <Globe className="w-4 h-4" />,
      title: 'Site (CMS)',
      desc: 'Editar seções das páginas do site.',
      link: '/admin/site-pages',
      linkLabel: 'Acessar',
    },
    {
      icon: <Globe className="w-4 h-4" />,
      title: 'Páginas',
      desc: 'Landing pages dinâmicas por cliente.',
      link: '/admin/pages',
      linkLabel: 'Acessar',
    },
    {
      icon: <ClipboardList className="w-4 h-4" />,
      title: 'Formulários',
      desc: 'Formulários dinâmicos e captura de leads.',
      link: '/admin/forms',
      linkLabel: 'Acessar',
    },
    {
      icon: <FileText className="w-4 h-4" />,
      title: 'Respostas EMP',
      desc: 'Diagnósticos estratégicos recebidos.',
      link: '/admin/emp',
      linkLabel: 'Acessar',
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <Card key={mod.link} className="flex flex-col gap-3 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                {mod.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{mod.title}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed flex-1">{mod.desc}</p>
            <Link
              to={mod.link}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-black transition-colors mt-auto"
            >
              {mod.linkLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
