import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useClientPortal } from '../../context/ClientPortalContext';
import {
  CalendarDays, Loader2, CheckCircle, XCircle, Clock, ChevronDown
} from 'lucide-react';

type Calendar = {
  id: string;
  title: string;
  slug: string;
  week_start: string;
  week_end: string;
  status: string;
};

type PostItem = {
  id: string;
  post_date: string;
  day_label: string;
  title: string;
  format: string;
  caption: string;
  post_status: string | null;
  post_feedback: string | null;
};

const FORMAT_COLORS: Record<string, string> = {
  Reels: 'bg-purple-50 text-purple-700',
  Carrossel: 'bg-blue-50 text-blue-700',
  'Post Estático': 'bg-gray-100 text-gray-600',
  Stories: 'bg-orange-50 text-orange-700',
};

export default function PortalCalendarPage() {
  const { client } = useClientPortal();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  // Feedback modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackPost, setFeedbackPost] = useState<PostItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    loadCalendars();
  }, [client]);

  useEffect(() => {
    if (selectedId) loadPosts(selectedId);
  }, [selectedId]);

  const loadCalendars = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('content_calendars')
      .select('*')
      .eq('client_id', client!.id)
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setCalendars(data as Calendar[]);
      setSelectedId(data[0].id);
    }
    setLoading(false);
  };

  const loadPosts = async (calendarId: string) => {
    setPostsLoading(true);
    const { data } = await supabase
      .from('content_calendar_items')
      .select('id, post_date, day_label, title, format, caption, post_status, post_feedback')
      .eq('calendar_id', calendarId)
      .order('post_date', { ascending: true });
    if (data) setPosts(data as PostItem[]);
    setPostsLoading(false);
  };

  const approve = async (post: PostItem) => {
    // Optimistic
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, post_status: 'aprovado' } : p));
    await supabase
      .from('content_calendar_items')
      .update({ post_status: 'aprovado', post_feedback: null })
      .eq('id', post.id);
  };

  const openFeedback = (post: PostItem) => {
    setFeedbackPost(post);
    setFeedback('');
    setFeedbackOpen(true);
  };

  const submitFeedback = async () => {
    if (!feedbackPost) return;
    setSaving(true);
    setPosts(prev => prev.map(p =>
      p.id === feedbackPost.id ? { ...p, post_status: 'reprovado', post_feedback: feedback } : p
    ));
    await supabase
      .from('content_calendar_items')
      .update({ post_status: 'reprovado', post_feedback: feedback || null })
      .eq('id', feedbackPost.id);
    setSaving(false);
    setFeedbackOpen(false);
  };

  const statusInfo = (status: string | null) => {
    if (status === 'aprovado') return {
      label: 'Aprovado',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      color: 'text-green-600',
      border: 'border-green-200',
      bg: 'bg-green-50',
    };
    if (status === 'reprovado') return {
      label: 'Ajustes solicitados',
      icon: <XCircle className="w-3.5 h-3.5" />,
      color: 'text-red-600',
      border: 'border-red-200',
      bg: 'bg-red-50',
    };
    return {
      label: 'Aguardando aprovação',
      icon: <Clock className="w-3.5 h-3.5" />,
      color: 'text-amber-600',
      border: 'border-amber-200',
      bg: 'bg-amber-50',
    };
  };

  const selectedCalendar = calendars.find(c => c.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <CalendarDays className="w-8 h-8 text-gray-300" />
        <p className="text-gray-500 text-sm">Nenhum calendário disponível.</p>
        <p className="text-gray-400 text-xs">Em breve seu calendário de conteúdo estará aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aprovação de Conteúdo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Aprove ou solicite ajustes nos posts do seu calendário.</p>
        </div>

        {/* Calendar selector */}
        {calendars.length > 1 && (
          <div className="relative">
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              {calendars.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Calendar info */}
      {selectedCalendar && (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
          <div>
            <span className="text-sm font-medium text-gray-900">{selectedCalendar.title}</span>
            <span className="text-xs text-gray-400 ml-2">
              {selectedCalendar.week_start && selectedCalendar.week_end
                ? `${new Date(selectedCalendar.week_start).toLocaleDateString('pt-BR')} – ${new Date(selectedCalendar.week_end).toLocaleDateString('pt-BR')}`
                : ''}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
            <span>{posts.filter(p => p.post_status === 'aprovado').length}/{posts.length} aprovados</span>
          </div>
        </div>
      )}

      {/* Posts grid */}
      {postsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Nenhum post neste calendário ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => {
            const si = statusInfo(post.post_status);
            const isPending = !post.post_status || post.post_status === 'pendente';
            const formatColor = FORMAT_COLORS[post.format] || 'bg-gray-100 text-gray-600';

            return (
              <div
                key={post.id}
                className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 transition-all ${si.border}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      {post.day_label} · {post.post_date ? new Date(post.post_date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                    </div>
                    <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${formatColor}`}>
                      {post.format}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-medium shrink-0 ${si.color}`}>
                    {si.icon}
                    <span className="hidden sm:inline">{si.label}</span>
                  </div>
                </div>

                {/* Title */}
                <div className="text-sm font-semibold text-gray-900 leading-tight">
                  {post.title}
                </div>

                {/* Caption preview */}
                {post.caption && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {post.caption}
                  </p>
                )}

                {/* Feedback (if rejected) */}
                {post.post_status === 'reprovado' && post.post_feedback && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <div className="text-[10px] font-semibold text-red-600 mb-0.5">Seu feedback:</div>
                    <p className="text-xs text-red-700">{post.post_feedback}</p>
                  </div>
                )}

                {/* Actions */}
                {isPending && (
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={() => approve(post)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => openFeedback(post)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium rounded-lg transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Solicitar ajustes
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && feedbackPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Solicitar ajustes</h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{feedbackPost.title}</strong> — descreva o que precisa ser alterado.
            </p>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Ex: Mudar o tom para mais descontraído, ajustar a CTA..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setFeedbackOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submitFeedback}
                disabled={saving}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50"
              >
                {saving ? 'Enviando...' : 'Enviar feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
