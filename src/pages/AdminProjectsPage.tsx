import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Layers, Plus, Loader2, CheckSquare, ArrowRight, Pause, Check, X } from 'lucide-react';
import { Project, Client, Employee } from '../types';
import { useAdminRole } from '../context/AdminRoleContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

type ProjectWithClient = Project & {
  clients?: { name: string } | null;
  task_count?: number;
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:    { label: 'Ativo',      color: 'bg-green-100 text-green-700', icon: <Check className="w-3 h-3" /> },
  paused:    { label: 'Pausado',    color: 'bg-yellow-100 text-yellow-700', icon: <Pause className="w-3 h-3" /> },
  completed: { label: 'Concluído', color: 'bg-gray-100 text-gray-600', icon: <CheckSquare className="w-3 h-3" /> },
};

const emptyForm = {
  name: '',
  description: '',
  client_id: '',
  status: 'active' as Project['status'],
};

export default function AdminProjectsPage() {
  const { role, employeeId } = useAdminRole();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectWithClient | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [projRes, clientsRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*, clients(name)')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id,name').order('name'),
    ]);

    if (projRes.data) {
      // Fetch task counts per project
      const ids = projRes.data.map((p: any) => p.id);
      let countMap: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: taskCounts } = await supabase
          .from('tasks')
          .select('project_id')
          .in('project_id', ids);
        if (taskCounts) {
          taskCounts.forEach((t: any) => {
            countMap[t.project_id] = (countMap[t.project_id] || 0) + 1;
          });
        }
      }
      setProjects(projRes.data.map((p: any) => ({ ...p, task_count: countMap[p.id] || 0 })));
    }
    if (clientsRes.data) setClients(clientsRes.data as Client[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (project: ProjectWithClient) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description || '',
      client_id: project.client_id,
      status: project.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.client_id) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      client_id: form.client_id,
      status: form.status,
      created_by_id: employeeId || null,
    };
    if (editing) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editing.id);
      if (error) alert('Erro: ' + error.message);
    } else {
      const { error } = await supabase.from('projects').insert([payload]);
      if (error) alert('Erro: ' + error.message);
    }
    setSaving(false);
    setModalOpen(false);
    loadAll();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este projeto? As tarefas vinculadas serão desvinculadas.')) return;
    await supabase.from('projects').delete().eq('id', id);
    loadAll();
  };

  let filtered = projects;
  if (filterClient) filtered = filtered.filter(p => p.client_id === filterClient);
  if (filterStatus) filtered = filtered.filter(p => p.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const canCreate = !role || ['admin', 'gestor', 'atendimento'].includes(role);

  return (
    <div className="p-6 md:p-10 flex flex-col gap-6 min-h-screen">
      <PageHeader
        title="Projetos"
        subtitle="Organize as demandas de cada cliente por projeto"
        icon={<Layers className="w-4 h-4" />}
        action={
          canCreate ? (
            <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
              Novo projeto
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos os clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="paused">Pausados</option>
          <option value="completed">Concluídos</option>
        </select>
        {(filterClient || filterStatus) && (
          <button
            onClick={() => { setFilterClient(''); setFilterStatus(''); }}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} projeto{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description={canCreate ? 'Crie um projeto para organizar as tarefas de cada cliente.' : 'Nenhum projeto disponível no momento.'}
          action={canCreate ? <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Novo projeto</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => {
            const st = STATUS_LABELS[project.status];
            return (
              <Card key={project.id} className="flex flex-col gap-3 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{project.name}</h3>
                    {project.clients?.name && (
                      <p className="text-xs text-gray-400 mt-0.5">{project.clients.name}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>
                    {st.icon}
                    {st.label}
                  </span>
                </div>

                {project.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-1 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {project.task_count} tarefa{project.task_count !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/admin/tarefas?project=${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    Ver tarefas <ArrowRight className="w-3 h-3" />
                  </Link>
                  {canCreate && (
                    <button
                      onClick={() => openEdit(project)}
                      className="ml-auto text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar projeto' : 'Novo projeto'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome do projeto *"
            type="text"
            required
            placeholder="Ex: Gestão de redes sociais Q2"
            value={form.name}
            onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
          />
          <Textarea
            label="Descrição"
            rows={3}
            placeholder="Escopo, objetivo e informações gerais..."
            value={form.description}
            onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Cliente *"
              value={form.client_id}
              onChange={e => setForm(s => ({ ...s, client_id: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={e => setForm(s => ({ ...s, status: e.target.value as Project['status'] }))}
            >
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2">
            {editing && (
              <button
                type="button"
                onClick={() => { handleDelete(editing.id); setModalOpen(false); }}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Excluir projeto
              </button>
            )}
            <div className={`flex gap-3 ${editing ? '' : 'ml-auto'}`}>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving} disabled={!form.name.trim() || !form.client_id}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
