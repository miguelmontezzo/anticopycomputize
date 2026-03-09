import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  CheckCircle, XCircle, Loader2, FileText, Target,
  Link as LinkIcon, Clock, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, AlertCircle
} from 'lucide-react';
import { useClientPortal } from '../../context/ClientPortalContext';
import { sendWhatsApp, WA_MESSAGES } from '../../lib/whatsapp';
import { WorkflowStatus } from '../../types';

type ApprovalTask = {
  id: string;
  title: string;
  workflow_status: WorkflowStatus;
  briefing: string | null;
  objective: string | null;
  format_type: string | null;
  reference_links: string | null;
  description: string | null;
  due_date: string | null;
  priority: string;
  employees?: { name: string; whatsapp?: string | null } | null;
  projects?: { name: string } | null;
};

const STATUS_INFO: Record<string, { label: string; description: string; color: string; bg: string }> = {
  client_review: {
    label: 'Aguardando sua revisão',
    description: 'Este conteúdo foi aprovado internamente e precisa da sua revisão antes de ir para produção.',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  client_approval: {
    label: 'Aguardando aprovação final',
    description: 'Este conteúdo foi produzido e está pronto. Sua aprovação final libera para publicação.',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
  },
};

// Next step after client approves
const NEXT_ON_APPROVE: Partial<Record<WorkflowStatus, WorkflowStatus>> = {
  client_review: 'production',
  client_approval: 'ready_to_post',
};

function TaskApprovalCard({
  task,
  onApproved,
  onRejected,
}: {
  task: ApprovalTask;
  onApproved: (id: string) => void;
  onRejected: (id: string, reason: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [confirmRejecting, setConfirmRejecting] = useState(false);

  const info = STATUS_INFO[task.workflow_status];

  const handleApprove = async () => {
    setApproving(true);
    const next = NEXT_ON_APPROVE[task.workflow_status];
    if (!next) { setApproving(false); return; }

    const { error } = await supabase.from('tasks').update({ workflow_status: next }).eq('id', task.id);
    if (error) { alert('Erro: ' + error.message); setApproving(false); return; }

    // Notify assignee via WhatsApp
    if (task.employees?.whatsapp) {
      sendWhatsApp(task.employees.whatsapp, WA_MESSAGES.clientApproved(task.title));
    }

    onApproved(task.id);
    setApproving(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setConfirmRejecting(true);

    const { error } = await supabase.from('tasks').update({
      workflow_status: 'rejected',
      rejection_reason: rejectionReason,
    }).eq('id', task.id);
    if (error) { alert('Erro: ' + error.message); setConfirmRejecting(false); return; }

    // Notify assignee via WhatsApp
    if (task.employees?.whatsapp) {
      sendWhatsApp(task.employees.whatsapp, WA_MESSAGES.clientRejected(task.title, rejectionReason));
    }

    onRejected(task.id, rejectionReason);
    setConfirmRejecting(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Status badge */}
      <div className={`px-5 py-3 ${info.bg} border-b border-gray-200`}>
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${info.color}`} />
          <span className={`text-xs font-semibold ${info.color}`}>{info.label}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
      </div>

      <div className="p-5">
        {/* Title & meta */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
              {task.format_type && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {task.format_type}
                </span>
              )}
              {task.projects?.name && <span>{task.projects.name}</span>}
              {task.employees?.name && <span>Criado por {task.employees.name.split(' ')[0]}</span>}
              {task.due_date && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(task.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content details (collapsible) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3 py-1"
        >
          <span className="font-medium">Ver detalhes do conteúdo</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {task.objective && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  <Target className="w-3.5 h-3.5" /> Objetivo
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{task.objective}</p>
              </div>
            )}
            {task.briefing && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5" /> Briefing / Contexto
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.briefing}</p>
              </div>
            )}
            {task.description && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Descrição
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
            {task.reference_links && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  <LinkIcon className="w-3.5 h-3.5" /> Referências
                </div>
                <div className="space-y-1">
                  {task.reference_links.split('\n').filter(Boolean).map((link, i) => (
                    link.startsWith('http') ? (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:underline truncate">
                        {link}
                      </a>
                    ) : (
                      <p key={i} className="text-sm text-gray-600">{link}</p>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!rejecting ? (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {approving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4" />
              )}
              {approving ? 'Aprovando...' : 'Aprovar'}
            </button>
            <button
              onClick={() => setRejecting(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-red-500 border border-red-200 py-3 px-4 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              Solicitar ajuste
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              autoFocus
              placeholder="Descreva o que precisa ser ajustado... (obrigatório)"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full border border-red-200 rounded-xl py-2.5 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || confirmRejecting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-4 rounded-xl font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {confirmRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Solicitar ajuste
              </button>
              <button
                onClick={() => { setRejecting(false); setRejectionReason(''); }}
                className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalApprovalsPage() {
  const { client } = useClientPortal();
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!client?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('id, title, workflow_status, briefing, objective, format_type, reference_links, description, due_date, priority, employees(name, whatsapp), projects(name)')
      .eq('client_id', client.id)
      .in('workflow_status', ['client_review', 'client_approval'])
      .order('updated_at', { ascending: false });
    if (data) setTasks(data as ApprovalTask[]);
    setLoading(false);
  }, [client?.id]);

  useEffect(() => { load(); }, [load]);

  const handleApproved = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  const handleRejected = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Aprovações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Conteúdos aguardando sua revisão e aprovação.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">Tudo em dia!</p>
            <p className="text-sm text-gray-400 mt-1">
              Nenhum conteúdo aguardando aprovação no momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            {tasks.length} item{tasks.length !== 1 ? 's' : ''} aguardando sua resposta
          </p>
          {tasks.map(task => (
            <TaskApprovalCard
              key={task.id}
              task={task}
              onApproved={handleApproved}
              onRejected={handleRejected}
            />
          ))}
        </div>
      )}
    </div>
  );
}
