import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Users, CalendarDays, Layers, CheckSquare, UserCog,
  ArrowRight, AlertCircle, Clock, TrendingUp, Zap,
  Timer, FolderKanban
} from 'lucide-react';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { useAdminRole } from '../context/AdminRoleContext';
import { WORKFLOW } from './AdminTasksPage';
import { WorkflowStatus } from '../types';

type StatsData = {
  tasksByStatus: Record<string, number>;
  overdueCount: number;
  totalTasks: number;
  clientCount: number;
  projectCount: number;
  publishedThisMonth: number;
  pendingClientApproval: number;
};

function StatCard({
  icon, label, value, sub, color = 'text-gray-900', linkTo,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
  linkTo?: string;
}) {
  const content = (
    <Card className="flex flex-col gap-2 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
          {icon}
        </div>
        {linkTo && <ArrowRight className="w-3.5 h-3.5 text-gray-400" />}
      </div>
      <div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </Card>
  );
  if (linkTo) return <Link to={linkTo} className="block">{content}</Link>;
  return content;
}

export default function AdminDashboardPage() {
  const { role, employeeName } = useAdminRole();
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
      await loadStats();
    };
    init();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [tasksRes, clientsRes, projectsRes, recentRes] = await Promise.all([
      supabase.from('tasks').select('workflow_status, due_date, time_spent_seconds'),
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase
        .from('tasks')
        .select('id, title, workflow_status, clients(name), employees(name), updated_at')
        .order('updated_at', { ascending: false })
        .limit(8),
    ]);

    if (tasksRes.data) {
      const tasks = tasksRes.data as any[];
      const tasksByStatus: Record<string, number> = {};
      let overdueCount = 0;
      let publishedThisMonth = 0;
      let pendingClientApproval = 0;

      tasks.forEach(t => {
        const ws = t.workflow_status || 'demand';
        tasksByStatus[ws] = (tasksByStatus[ws] || 0) + 1;

        if (t.due_date) {
          const due = new Date(t.due_date);
          if (due < new Date(new Date().toDateString()) && ws !== 'published') overdueCount++;
        }
        if (ws === 'published' && t.updated_at >= monthStart) publishedThisMonth++;
        if (ws === 'client_review' || ws === 'client_approval') pendingClientApproval++;
      });

      setStats({
        tasksByStatus,
        overdueCount,
        totalTasks: tasks.length,
        clientCount: clientsRes.count || 0,
        projectCount: projectsRes.count || 0,
        publishedThisMonth,
        pendingClientApproval,
      });
    }

    if (recentRes.data) setRecentTasks(recentRes.data as any[]);
    setLoading(false);
  };

  const firstName = employeeName?.split(' ')[0] || userEmail.split('@')[0] || 'Admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const modules = [
    { icon: <Users className="w-4 h-4" />, title: 'Clientes', desc: 'Gerenciar empresas e pessoas atendidas.', link: '/admin/clients' },
    { icon: <FolderKanban className="w-4 h-4" />, title: 'Projetos', desc: 'Organize projetos por cliente.', link: '/admin/projetos' },
    { icon: <CalendarDays className="w-4 h-4" />, title: 'Calendários', desc: 'Calendários de conteúdo semanais.', link: '/admin/calendarios' },
    { icon: <CheckSquare className="w-4 h-4" />, title: 'Tarefas & Fluxo', desc: 'Pipeline completo de produção.', link: '/admin/tarefas' },
    { icon: <UserCog className="w-4 h-4" />, title: 'Equipe', desc: 'Colaboradores e permissões.', link: '/admin/equipe', roles: ['admin'] as string[] },
  ];

  const visibleModules = modules.filter(m => !m.roles || !role || m.roles.includes(role));

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      {stats && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<CheckSquare className="w-4 h-4" />}
              label="Total de tarefas"
              value={stats.totalTasks}
              linkTo="/admin/tarefas"
            />
            <StatCard
              icon={<AlertCircle className="w-4 h-4" />}
              label="Atrasadas"
              value={stats.overdueCount}
              color={stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}
              sub={stats.overdueCount > 0 ? 'Necessitam atenção' : 'Tudo em dia!'}
              linkTo="/admin/tarefas"
            />
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              label="Aguardam cliente"
              value={stats.pendingClientApproval}
              color={stats.pendingClientApproval > 0 ? 'text-blue-600' : 'text-gray-900'}
              sub="Para aprovação"
              linkTo="/admin/tarefas"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Publicados"
              value={stats.publishedThisMonth}
              sub="Este mês"
              linkTo="/admin/tarefas"
            />
          </div>

          {/* Pipeline summary */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Pipeline atual</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {WORKFLOW.filter(w => w.key !== 'rejected').map(col => {
                const count = stats.tasksByStatus[col.key] || 0;
                return (
                  <Link key={col.key} to={`/admin/tarefas`}>
                    <div className={`${col.bg} border border-gray-200 rounded-xl p-3 flex flex-col gap-1 hover:border-gray-300 transition-colors`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                        <span className={`text-[11px] font-semibold ${col.color}`}>{col.short}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{count}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modules */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleModules.map((mod) => (
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
                Acessar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Atividade recente</h2>
          <Card className="divide-y divide-gray-100">
            {recentTasks.map(task => {
              const ws = (task.workflow_status || 'demand') as WorkflowStatus;
              const col = WORKFLOW.find(w => w.key === ws)!;
              return (
                <Link
                  key={task.id}
                  to="/admin/tarefas"
                  className="flex items-center gap-3 px-1 py-3 hover:bg-gray-50 -mx-1 rounded-lg transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col?.dotColor || 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">
                      {task.clients?.name && `${task.clients.name} · `}
                      {task.employees?.name?.split(' ')[0]}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${col?.bg} ${col?.color} shrink-0`}>
                    {col?.short}
                  </span>
                </Link>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
