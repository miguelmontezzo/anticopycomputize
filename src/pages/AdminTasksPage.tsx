import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  CheckSquare, Plus, Loader2, Flag, User, Calendar,
  AlertCircle, Clock, X, ChevronRight, ChevronLeft,
  Play, Square, Timer, FileText, Link as LinkIcon, Target,
  Send, ArrowRight, RotateCcw
} from 'lucide-react';
import { Task, WorkflowStatus, TaskPriority, Employee, Project, FormatType } from '../types';
import { useAdminRole } from '../context/AdminRoleContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import { sendWhatsApp, WA_MESSAGES } from '../lib/whatsapp';

// ─── Types ───────────────────────────────────────────────────────────────────

type Client = { id: string; name: string; whatsapp?: string | null };
type TaskWithRelations = Task & {
  clients?: { name: string; whatsapp?: string | null } | null;
  employees?: { name: string; whatsapp?: string | null } | null;
  projects?: { name: string } | null;
};

// ─── Workflow config ──────────────────────────────────────────────────────────

export const WORKFLOW: {
  key: WorkflowStatus;
  label: string;
  short: string;
  color: string;
  bg: string;
  dotColor: string;
  clientVisible?: boolean;
}[] = [
  { key: 'demand',            label: 'Demanda',          short: 'Demanda',     color: 'text-gray-600',    bg: 'bg-gray-100',    dotColor: 'bg-gray-400' },
  { key: 'strategy',          label: 'Estratégia',        short: 'Estratégia',  color: 'text-purple-700',  bg: 'bg-purple-50',   dotColor: 'bg-purple-400' },
  { key: 'internal_review',   label: 'Revisão Interna',  short: 'Rev. Interna',color: 'text-yellow-700',  bg: 'bg-yellow-50',   dotColor: 'bg-yellow-400' },
  { key: 'client_review',     label: 'Cliente Revisa',   short: 'Cl. Revisa',  color: 'text-blue-700',    bg: 'bg-blue-50',     dotColor: 'bg-blue-400',   clientVisible: true },
  { key: 'production',        label: 'Em Criação',       short: 'Criação',     color: 'text-orange-700',  bg: 'bg-orange-50',   dotColor: 'bg-orange-400' },
  { key: 'internal_approval', label: 'Aprov. Interna',   short: 'Aprov. Int.', color: 'text-amber-700',   bg: 'bg-amber-50',    dotColor: 'bg-amber-400' },
  { key: 'client_approval',   label: 'Aprov. Cliente',   short: 'Aprov. Cl.',  color: 'text-indigo-700',  bg: 'bg-indigo-50',   dotColor: 'bg-indigo-400', clientVisible: true },
  { key: 'ready_to_post',     label: 'Para Postar',      short: 'Para Postar', color: 'text-emerald-700', bg: 'bg-emerald-50',  dotColor: 'bg-emerald-400' },
  { key: 'published',         label: 'Publicado',        short: 'Publicado',   color: 'text-green-700',   bg: 'bg-green-50',    dotColor: 'bg-green-500' },
  { key: 'rejected',          label: 'Reprovado',        short: 'Reprovado',   color: 'text-red-700',     bg: 'bg-red-50',      dotColor: 'bg-red-400' },
];

const workflowMap = Object.fromEntries(WORKFLOW.map(w => [w.key, w]));
const DISPLAY_COLUMNS: WorkflowStatus[] = [
  'demand', 'strategy', 'internal_review', 'client_review',
  'production', 'internal_approval', 'client_approval',
  'ready_to_post', 'published', 'rejected',
];

// Next step in the main pipeline (not including rejected)
const NEXT_STEP: Partial<Record<WorkflowStatus, WorkflowStatus>> = {
  demand:            'strategy',
  strategy:          'internal_review',
  internal_review:   'client_review',
  client_review:     'production',
  production:        'internal_approval',
  internal_approval: 'client_approval',
  client_approval:   'ready_to_post',
  ready_to_post:     'published',
};

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low',    label: 'Baixa',   color: 'text-gray-400' },
  { value: 'normal', label: 'Normal',  color: 'text-blue-400' },
  { value: 'high',   label: 'Alta',    color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-500' },
];

const FORMAT_TYPES: FormatType[] = ['Reels', 'Post Estático', 'Carrossel', 'Stories', 'Video', 'Outro'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function getLiveSeconds(task: TaskWithRelations): number {
  let total = task.time_spent_seconds || 0;
  if (task.timer_started_at) {
    const started = new Date(task.timer_started_at).getTime();
    total += Math.floor((Date.now() - started) / 1000);
  }
  return total;
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

// ─── Role-based workflow permissions ─────────────────────────────────────────

function canAdvance(role: string | null, currentStatus: WorkflowStatus): boolean {
  if (!role || role === 'admin' || role === 'gestor') return true;
  const map: Partial<Record<WorkflowStatus, string[]>> = {
    demand:            ['atendimento', 'gestor'],
    strategy:          ['social_media', 'gestor'],
    internal_review:   ['gestor'],
    client_review:     ['atendimento', 'gestor'],
    production:        ['editor', 'gestor'],
    internal_approval: ['gestor', 'atendimento'],
    client_approval:   ['atendimento', 'gestor'],
    ready_to_post:     ['social_media', 'gestor'],
  };
  return (map[currentStatus] || ['gestor', 'admin']).includes(role);
}

// ─── Blank form ───────────────────────────────────────────────────────────────

const emptyForm = {
  title: '',
  description: '',
  briefing: '',
  objective: '',
  format_type: '' as FormatType | '',
  reference_links: '',
  client_id: '',
  project_id: '',
  assignee_id: '',
  due_date: '',
  priority: 'normal' as TaskPriority,
  workflow_status: 'demand' as WorkflowStatus,
  task_type: 'content',
  rejection_reason: '',
};

// ─── Task Card ────────────────────────────────────────────────────────────────

const TaskCard = React.memo(function TaskCard({
  task, onClick, onDragStart,
}: {
  task: TaskWithRelations;
  onClick: () => void;
  onDragStart: () => void;
}) {
  const [liveSeconds, setLiveSeconds] = useState(() => getLiveSeconds(task));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLiveSeconds(getLiveSeconds(task));
    if (task.timer_started_at) {
      timerRef.current = setInterval(() => setLiveSeconds(getLiveSeconds(task)), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [task.timer_started_at, task.time_spent_seconds]);

  const pri = PRIORITIES.find(p => p.value === task.priority)!;
  const overdue = isOverdue(task.due_date) && task.workflow_status !== 'published';
  const running = !!task.timer_started_at;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all select-none"
    >
      <div className="flex items-start gap-2 mb-2">
        <Flag className={`w-3 h-3 mt-0.5 shrink-0 ${pri.color}`} />
        <span className="text-sm font-medium text-gray-900 leading-tight">{task.title}</span>
      </div>

      {task.briefing && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-1 pl-5">{task.briefing}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-400 pl-5">
        {task.clients?.name && (
          <span className="flex items-center gap-1">
            <ArrowRight className="w-2.5 h-2.5" />{task.clients.name}
          </span>
        )}
        {task.projects?.name && (
          <span className="flex items-center gap-1 text-gray-300">
            · {task.projects.name}
          </span>
        )}
        {task.employees?.name && (
          <span className="flex items-center gap-1">
            <User className="w-2.5 h-2.5" />{task.employees.name.split(' ')[0]}
          </span>
        )}
        {task.due_date && (
          <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
            {overdue ? <AlertCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
            {new Date(task.due_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
        {liveSeconds > 0 && (
          <span className={`flex items-center gap-1 ml-auto ${running ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
            {running && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />}
            <Timer className="w-2.5 h-2.5" />
            {formatDuration(liveSeconds)}
          </span>
        )}
      </div>
    </div>
  );
});

// ─── Task Detail Modal ────────────────────────────────────────────────────────

function TaskDetailModal({
  task,
  open,
  onClose,
  onSaved,
  onDeleted,
  clients,
  employees,
  projects,
  role,
}: {
  task: TaskWithRelations | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  clients: Client[];
  employees: Employee[];
  projects: { id: string; name: string; client_id: string }[];
  role: string | null;
}) {
  const [tab, setTab] = useState<'briefing' | 'details' | 'timer'>('briefing');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title,
      description: task.description || '',
      briefing: task.briefing || '',
      objective: task.objective || '',
      format_type: (task.format_type as FormatType) || '',
      reference_links: task.reference_links || '',
      client_id: task.client_id || '',
      project_id: task.project_id || '',
      assignee_id: task.assignee_id || '',
      due_date: task.due_date || '',
      priority: task.priority,
      workflow_status: task.workflow_status || 'demand',
      task_type: task.task_type || 'content',
      rejection_reason: task.rejection_reason || '',
    });
    setShowRejectInput(false);
    setTab('briefing');

    // Timer
    const running = !!task.timer_started_at;
    setTimerRunning(running);
    setLiveSeconds(getLiveSeconds(task));
    if (timerRef.current) clearInterval(timerRef.current);
    if (running) {
      timerRef.current = setInterval(() => setLiveSeconds(getLiveSeconds(task)), 1000);
    }
  }, [task]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!task) return;
    setSaving(true);
    const payload: any = {
      title: form.title,
      description: form.description || null,
      briefing: form.briefing || null,
      objective: form.objective || null,
      format_type: form.format_type || null,
      reference_links: form.reference_links || null,
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      assignee_id: form.assignee_id || null,
      due_date: form.due_date || null,
      priority: form.priority,
      workflow_status: form.workflow_status,
      task_type: form.task_type || null,
      rejection_reason: form.rejection_reason || null,
    };
    const { error } = await supabase.from('tasks').update(payload).eq('id', task.id);
    if (error) alert('Erro ao salvar: ' + error.message);
    setSaving(false);
    onSaved();
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      title: form.title,
      description: form.description || null,
      briefing: form.briefing || null,
      objective: form.objective || null,
      format_type: form.format_type || null,
      reference_links: form.reference_links || null,
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      assignee_id: form.assignee_id || null,
      due_date: form.due_date || null,
      priority: form.priority,
      workflow_status: form.workflow_status,
      task_type: form.task_type || null,
      status: 'todo',
      time_spent_seconds: 0,
    };
    const { error } = await supabase.from('tasks').insert([payload]);
    if (error) alert('Erro ao criar: ' + error.message);
    setSaving(false);
    onSaved();
    onClose();
  };

  const handleAdvance = async () => {
    if (!task) return;
    const next = NEXT_STEP[form.workflow_status];
    if (!next) return;
    setForm(f => ({ ...f, workflow_status: next }));
    await supabase.from('tasks').update({ workflow_status: next }).eq('id', task.id);

    // WhatsApp notifications
    if (next === 'client_review' || next === 'client_approval') {
      const clientPhone = task.clients?.whatsapp;
      if (clientPhone) {
        const msg = next === 'client_review'
          ? WA_MESSAGES.clientReviewReady(task.title, task.clients?.name || '')
          : WA_MESSAGES.clientApprovalReady(task.title, task.clients?.name || '');
        sendWhatsApp(clientPhone, msg);
      }
    }
    if (next === 'ready_to_post') {
      const assigneePhone = task.employees?.whatsapp;
      if (assigneePhone) sendWhatsApp(assigneePhone, WA_MESSAGES.readyToPost(task.title));
    }
    if (next === 'published') {
      const clientPhone = task.clients?.whatsapp;
      if (clientPhone) sendWhatsApp(clientPhone, WA_MESSAGES.published(task.title, task.clients?.name || ''));
    }

    onSaved();
    onClose();
  };

  const handleReject = async () => {
    if (!task) return;
    await supabase.from('tasks').update({
      workflow_status: 'rejected',
      rejection_reason: form.rejection_reason || null,
    }).eq('id', task.id);
    setForm(f => ({ ...f, workflow_status: 'rejected' }));

    const assigneePhone = task.employees?.whatsapp;
    if (assigneePhone) {
      sendWhatsApp(assigneePhone, WA_MESSAGES.clientRejected(task.title, form.rejection_reason || 'Sem motivo informado'));
    }

    onSaved();
    onClose();
  };

  const handleRestart = async () => {
    if (!task) return;
    await supabase.from('tasks').update({ workflow_status: 'demand', rejection_reason: null }).eq('id', task.id);
    setForm(f => ({ ...f, workflow_status: 'demand', rejection_reason: '' }));
    onSaved();
    onClose();
  };

  const toggleTimer = async () => {
    if (!task) return;
    if (timerRunning) {
      // Stop timer
      const extra = Math.floor((Date.now() - new Date(task.timer_started_at!).getTime()) / 1000);
      const newTotal = (task.time_spent_seconds || 0) + extra;
      await supabase.from('tasks').update({ timer_started_at: null, time_spent_seconds: newTotal }).eq('id', task.id);
      clearInterval(timerRef.current!);
      setTimerRunning(false);
      setLiveSeconds(newTotal);
      onSaved();
    } else {
      // Start timer
      const now = new Date().toISOString();
      await supabase.from('tasks').update({ timer_started_at: now }).eq('id', task.id);
      setTimerRunning(true);
      timerRef.current = setInterval(() => setLiveSeconds(getLiveSeconds({ ...task, timer_started_at: now })), 1000);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm('Excluir esta tarefa?')) return;
    await supabase.from('tasks').delete().eq('id', task.id);
    onDeleted();
    onClose();
  };

  const isNew = !task;
  const wf = workflowMap[form.workflow_status];
  const nextStep = NEXT_STEP[form.workflow_status];
  const nextWf = nextStep ? workflowMap[nextStep] : null;
  const userCanAdvance = canAdvance(role, form.workflow_status);

  const filteredProjects = projects.filter(p => !form.client_id || p.client_id === form.client_id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Nova tarefa' : 'Detalhes da tarefa'}
      size="xl"
    >
      <form onSubmit={isNew ? handleCreate : handleSave} className="flex flex-col gap-4">
        {/* Status badge */}
        {!isNew && (
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${wf.bg} ${wf.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${wf.dotColor}`} />
              {wf.label}
            </span>
            {form.workflow_status === 'rejected' && form.rejection_reason && (
              <span className="text-xs text-red-500 italic">"{form.rejection_reason}"</span>
            )}
            {liveSeconds > 0 && (
              <span className={`ml-auto flex items-center gap-1.5 text-xs font-mono ${timerRunning ? 'text-emerald-600' : 'text-gray-500'}`}>
                {timerRunning && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                <Timer className="w-3.5 h-3.5" />
                {formatDuration(liveSeconds)}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Input
          label="Título *"
          type="text"
          required
          placeholder="Descreva a tarefa..."
          value={form.title}
          onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
        />

        {/* Client / Project / Assignee */}
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Cliente"
            value={form.client_id}
            onChange={e => setForm(s => ({ ...s, client_id: e.target.value, project_id: '' }))}
          >
            <option value="">Nenhum</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select
            label="Projeto"
            value={form.project_id}
            onChange={e => setForm(s => ({ ...s, project_id: e.target.value }))}
          >
            <option value="">Sem projeto</option>
            {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            {([
              { key: 'briefing', label: 'Briefing', icon: <FileText className="w-3.5 h-3.5" /> },
              { key: 'details', label: 'Detalhes', icon: <Target className="w-3.5 h-3.5" /> },
              { key: 'timer', label: 'Tempo', icon: <Timer className="w-3.5 h-3.5" /> },
            ] as const).map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Briefing */}
        {tab === 'briefing' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Formato"
                value={form.format_type}
                onChange={e => setForm(s => ({ ...s, format_type: e.target.value as FormatType }))}
              >
                <option value="">Sem formato</option>
                {FORMAT_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
              <Select
                label="Tipo de tarefa"
                value={form.task_type}
                onChange={e => setForm(s => ({ ...s, task_type: e.target.value }))}
              >
                <option value="content">Conteúdo</option>
                <option value="design">Design</option>
                <option value="copy">Copywriting</option>
                <option value="strategy">Estratégia</option>
                <option value="other">Outro</option>
              </Select>
            </div>
            <Textarea
              label="Briefing"
              rows={3}
              placeholder="Descreva o contexto, referências e orientações para quem vai executar..."
              value={form.briefing}
              onChange={e => setForm(s => ({ ...s, briefing: e.target.value }))}
            />
            <Textarea
              label="Objetivo"
              rows={2}
              placeholder="Qual o objetivo deste conteúdo? O que queremos comunicar?"
              value={form.objective}
              onChange={e => setForm(s => ({ ...s, objective: e.target.value }))}
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> Links de referência</span>
              </label>
              <textarea
                rows={2}
                placeholder="Cole links de referência, inspirações, exemplos... (um por linha)"
                value={form.reference_links}
                onChange={e => setForm(s => ({ ...s, reference_links: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab: Details */}
        {tab === 'details' && (
          <div className="space-y-3">
            <Textarea
              label="Descrição / observações"
              rows={3}
              placeholder="Informações adicionais, observações internas..."
              value={form.description}
              onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Prioridade"
                value={form.priority}
                onChange={e => setForm(s => ({ ...s, priority: e.target.value as TaskPriority }))}
              >
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
              <Input
                label="Data de entrega"
                type="date"
                value={form.due_date}
                onChange={e => setForm(s => ({ ...s, due_date: e.target.value }))}
              />
              {isNew && (
                <Select
                  label="Status inicial"
                  value={form.workflow_status}
                  onChange={e => setForm(s => ({ ...s, workflow_status: e.target.value as WorkflowStatus }))}
                >
                  {WORKFLOW.filter(w => w.key !== 'rejected' && w.key !== 'published').map(w => (
                    <option key={w.key} value={w.key}>{w.label}</option>
                  ))}
                </Select>
              )}
            </div>
          </div>
        )}

        {/* Tab: Timer */}
        {tab === 'timer' && !isNew && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="text-4xl font-mono font-bold text-gray-900">
              {formatDuration(liveSeconds)}
            </div>
            <p className="text-sm text-gray-500">
              {timerRunning ? 'Cronômetro rodando...' : 'Cronômetro parado'}
            </p>
            <Button
              type="button"
              variant={timerRunning ? 'danger' : 'primary'}
              icon={timerRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={toggleTimer}
            >
              {timerRunning ? 'Parar cronômetro' : 'Iniciar cronômetro'}
            </Button>
            {liveSeconds > 0 && !timerRunning && (
              <button
                type="button"
                onClick={async () => {
                  if (!task) return;
                  if (!window.confirm('Zerar o tempo registrado?')) return;
                  await supabase.from('tasks').update({ time_spent_seconds: 0, timer_started_at: null }).eq('id', task.id);
                  setLiveSeconds(0);
                  onSaved();
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Zerar tempo
              </button>
            )}
          </div>
        )}

        {/* Workflow actions (only for existing tasks) */}
        {!isNew && form.workflow_status !== 'published' && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avançar fluxo</p>

            {form.workflow_status === 'rejected' ? (
              <div className="flex gap-2">
                <Button type="button" icon={<RotateCcw className="w-4 h-4" />} onClick={handleRestart}>
                  Reiniciar demanda
                </Button>
              </div>
            ) : (
              <>
                {showRejectInput ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      placeholder="Motivo da reprovação (obrigatório)..."
                      value={form.rejection_reason}
                      onChange={e => setForm(s => ({ ...s, rejection_reason: e.target.value }))}
                      rows={2}
                      className="w-full bg-white border border-red-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={handleReject}
                        disabled={!form.rejection_reason.trim()}
                      >
                        Confirmar reprovação
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setShowRejectInput(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {nextWf && userCanAdvance && (
                      <Button
                        type="button"
                        icon={<ChevronRight className="w-4 h-4" />}
                        onClick={handleAdvance}
                      >
                        Avançar para {nextWf.label}
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(true)}
                      className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Reprovar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Excluir tarefa
            </button>
          )}
          <div className={`flex gap-3 ${!isNew ? '' : 'ml-auto'}`}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Salvando...' : isNew ? 'Criar tarefa' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTasksPage() {
  const { role, employeeId } = useAdminRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; client_id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterClient, setFilterClient] = useState(searchParams.get('client') || '');
  const [filterProject, setFilterProject] = useState(searchParams.get('project') || '');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [newStatus, setNewStatus] = useState<WorkflowStatus>('demand');

  const draggingId = useRef<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [tasksRes, clientsRes, empsRes, projRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, clients(name, whatsapp), employees(name, whatsapp), projects(name)')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id,name,whatsapp').order('name'),
      supabase.from('employees').select('*').eq('is_active', true).order('name'),
      supabase.from('projects').select('id,name,client_id').eq('status', 'active').order('name'),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data as TaskWithRelations[]);
    if (clientsRes.data) setClients(clientsRes.data as Client[]);
    if (empsRes.data) setEmployees(empsRes.data as Employee[]);
    if (projRes.data) setProjects(projRes.data as any[]);
    setLoading(false);
  }, []);

  const openCreate = (status: WorkflowStatus = 'demand') => {
    setSelectedTask(null);
    setNewStatus(status);
    setModalOpen(true);
  };

  const openTask = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // Drag & drop
  const handleDragStart = (taskId: string) => { draggingId.current = taskId; };
  const handleDrop = async (targetStatus: WorkflowStatus) => {
    const id = draggingId.current;
    if (!id) return;
    draggingId.current = null;
    const task = tasks.find(t => t.id === id);
    if (!task || task.workflow_status === targetStatus) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, workflow_status: targetStatus } : t));
    const { error } = await supabase.from('tasks').update({ workflow_status: targetStatus }).eq('id', id);
    if (error) { loadAll(); alert('Erro ao mover tarefa.'); }
  };

  // Filter tasks
  let filtered = tasks;
  if (role === 'social_media' && employeeId) filtered = filtered.filter(t => t.assignee_id === employeeId);
  if (filterClient) filtered = filtered.filter(t => t.client_id === filterClient);
  if (filterProject) filtered = filtered.filter(t => t.project_id === filterProject);
  if (filterAssignee) filtered = filtered.filter(t => t.assignee_id === filterAssignee);
  if (search) filtered = filtered.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.briefing?.toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = (status: WorkflowStatus) => filtered.filter(t => (t.workflow_status || 'demand') === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const filteredProjects = projects.filter(p => !filterClient || p.client_id === filterClient);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-5 min-h-screen">
      <PageHeader
        title="Tarefas & Fluxo"
        subtitle="Pipeline completo de produção — arraste entre colunas"
        icon={<CheckSquare className="w-4 h-4" />}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => openCreate()}>
            Nova tarefa
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black w-36"
        />
        <select
          value={filterClient}
          onChange={e => { setFilterClient(e.target.value); setFilterProject(''); }}
          className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos projetos</option>
          {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
        {(filterClient || filterProject || filterAssignee || search) && (
          <button
            onClick={() => { setFilterClient(''); setFilterProject(''); setFilterAssignee(''); setSearch(''); }}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Kanban — horizontal scroll */}
      <div className="overflow-x-auto pb-4 -mx-1">
        <div className="flex gap-3 min-w-max px-1">
          {DISPLAY_COLUMNS.map(colKey => {
            const col = workflowMap[colKey];
            const colTasks = byStatus(colKey);
            return (
              <div
                key={colKey}
                className="flex flex-col gap-2 w-[220px] shrink-0"
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(colKey)}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-2.5 py-2 rounded-lg border border-gray-200 bg-white`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                    <span className="text-xs font-semibold text-gray-700 truncate">{col.short}</span>
                    <span className="text-xs text-gray-400 shrink-0">{colTasks.length}</span>
                  </div>
                  <button
                    onClick={() => openCreate(colKey)}
                    className="p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors shrink-0"
                    title={`Nova tarefa em ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Drop zone */}
                <div className="flex-1 flex flex-col gap-2 min-h-[200px] bg-gray-50/80 rounded-xl p-1.5 border border-dashed border-gray-200 transition-colors">
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-xs text-gray-300">
                      vazio
                    </div>
                  )}
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => openTask(task)}
                      onDragStart={() => handleDragStart(task.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task modal */}
      <TaskDetailModal
        open={modalOpen}
        task={selectedTask}
        onClose={() => { setModalOpen(false); setSelectedTask(null); }}
        onSaved={loadAll}
        onDeleted={loadAll}
        clients={clients}
        employees={employees}
        projects={projects}
        role={role}
      />
    </div>
  );
}
