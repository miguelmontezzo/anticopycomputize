import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  CheckSquare, Plus, Loader2, Flag, User, Calendar,
  AlertCircle, Clock, ArrowRight, X
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Employee } from '../types';
import { useAdminRole } from '../context/AdminRoleContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';

type Client = { id: string; name: string };
type TaskWithRelations = Task & {
  clients?: { name: string } | null;
  employees?: { name: string } | null;
};

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'A Fazer', color: 'bg-gray-100 text-gray-600' },
  { key: 'in_progress', label: 'Em Andamento', color: 'bg-blue-50 text-blue-700' },
  { key: 'done', label: 'Concluído', color: 'bg-green-50 text-green-700' },
];

const PRIORITIES: { value: TaskPriority; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'low', label: 'Baixa', icon: <Flag className="w-3 h-3" />, color: 'text-gray-400' },
  { value: 'normal', label: 'Normal', icon: <Flag className="w-3 h-3" />, color: 'text-blue-400' },
  { value: 'high', label: 'Alta', icon: <AlertCircle className="w-3 h-3" />, color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgente', icon: <AlertCircle className="w-3 h-3" />, color: 'text-red-500' },
];

const priorityInfo = (p: TaskPriority) => PRIORITIES.find(x => x.value === p)!;

const emptyForm = {
  title: '',
  description: '',
  client_id: '',
  assignee_id: '',
  due_date: '',
  priority: 'normal' as TaskPriority,
  status: 'todo' as TaskStatus,
};

export default function AdminTasksPage() {
  const { employeeId, role } = useAdminRole();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClient, setFilterClient] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [search, setSearch] = useState('');

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Drag state
  const draggingId = useRef<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    if (!supabase) { setLoading(false); return; }
    const [tasksRes, clientsRes, empsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, clients(name), employees(name)')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id,name').order('name'),
      supabase.from('employees').select('*').eq('is_active', true).order('name'),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data as TaskWithRelations[]);
    if (clientsRes.data) setClients(clientsRes.data as Client[]);
    if (empsRes.data) setEmployees(empsRes.data as Employee[]);
    setLoading(false);
  };

  const openCreate = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setForm({ ...emptyForm, status });
    setModalOpen(true);
  };

  const openEdit = (task: TaskWithRelations) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      client_id: task.client_id || '',
      assignee_id: task.assignee_id || '',
      due_date: task.due_date || '',
      priority: task.priority,
      status: task.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || null,
      client_id: form.client_id || null,
      assignee_id: form.assignee_id || null,
      due_date: form.due_date || null,
      priority: form.priority,
      status: form.status,
    };
    if (editingTask) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', editingTask.id);
      if (error) alert('Erro: ' + error.message);
    } else {
      const { error } = await supabase.from('tasks').insert([payload]);
      if (error) alert('Erro: ' + error.message);
    }
    setSaving(false);
    setModalOpen(false);
    loadAll();
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm('Excluir esta tarefa?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    loadAll();
  };

  // Drag-and-drop handlers
  const handleDragStart = (taskId: string) => {
    draggingId.current = taskId;
  };

  const handleDrop = async (targetStatus: TaskStatus) => {
    const id = draggingId.current;
    if (!id) return;
    draggingId.current = null;
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === targetStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: targetStatus } : t));
    const { error } = await supabase.from('tasks').update({ status: targetStatus }).eq('id', id);
    if (error) {
      loadAll(); // revert on error
      alert('Erro ao mover tarefa.');
    }
  };

  // Filter tasks
  let filtered = tasks;
  // Social media: only see their assigned tasks
  if (role === 'social_media' && employeeId) {
    filtered = filtered.filter(t => t.assignee_id === employeeId);
  }
  if (filterClient) filtered = filtered.filter(t => t.client_id === filterClient);
  if (filterAssignee) filtered = filtered.filter(t => t.assignee_id === filterAssignee);
  if (search) filtered = filtered.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const byStatus = (status: TaskStatus) => filtered.filter(t => t.status === status);

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col gap-6 min-h-screen">
      <PageHeader
        title="Tarefas"
        subtitle="Kanban da equipe — arraste entre colunas"
        icon={<CheckSquare className="w-4 h-4" />}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => openCreate()}>
            Nova tarefa
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar tarefa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors w-44"
        />
        <select
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {role !== 'social_media' && (
          <select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Todos responsáveis</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        )}
        {(filterClient || filterAssignee || search) && (
          <button
            onClick={() => { setFilterClient(''); setFilterAssignee(''); setSearch(''); }}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            className="flex flex-col gap-3 min-h-[400px]"
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs text-gray-400">{byStatus(col.key).length}</span>
              </div>
              <button
                onClick={() => openCreate(col.key)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Nova tarefa nesta coluna"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drop zone */}
            <div className="flex-1 flex flex-col gap-2 bg-gray-100/50 rounded-xl p-2 border-2 border-transparent transition-colors">
              {byStatus(col.key).length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-gray-400">
                  Solte aqui ou clique em +
                </div>
              )}

              {byStatus(col.key).map(task => {
                const pri = priorityInfo(task.priority);
                const overdue = isOverdue(task.due_date) && task.status !== 'done';
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onClick={() => openEdit(task)}
                    className="bg-white border border-gray-200 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all select-none"
                  >
                    {/* Priority + title */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`mt-0.5 shrink-0 ${pri.color}`} title={`Prioridade: ${pri.label}`}>
                        {pri.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-900 leading-tight">{task.title}</span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                      {task.clients?.name && (
                        <span className="flex items-center gap-1">
                          <ArrowRight className="w-2.5 h-2.5" />
                          {task.clients.name}
                        </span>
                      )}
                      {task.employees?.name && (
                        <span className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          {task.employees.name.split(' ')[0]}
                        </span>
                      )}
                      {task.due_date && (
                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                          {overdue ? <AlertCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Título *"
            type="text"
            required
            placeholder="Descreva a tarefa..."
            value={form.title}
            onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
          />
          <Textarea
            label="Descrição"
            rows={3}
            placeholder="Detalhes adicionais..."
            value={form.description}
            onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Cliente"
              value={form.client_id}
              onChange={e => setForm(s => ({ ...s, client_id: e.target.value }))}
            >
              <option value="">Nenhum</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select
              label="Responsável"
              value={form.assignee_id}
              onChange={e => setForm(s => ({ ...s, assignee_id: e.target.value }))}
            >
              <option value="">Sem responsável</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Prioridade"
              value={form.priority}
              onChange={e => setForm(s => ({ ...s, priority: e.target.value as TaskPriority }))}
            >
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={e => setForm(s => ({ ...s, status: e.target.value as TaskStatus }))}
            >
              {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </Select>
          </div>
          <Input
            label="Data de entrega"
            type="date"
            value={form.due_date}
            onChange={e => setForm(s => ({ ...s, due_date: e.target.value }))}
          />
          <div className="flex items-center justify-between pt-2">
            {editingTask && (
              <button
                type="button"
                onClick={() => { deleteTask(editingTask.id); setModalOpen(false); }}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Excluir tarefa
              </button>
            )}
            <div className={`flex gap-3 ${editingTask ? '' : 'ml-auto'}`}>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
