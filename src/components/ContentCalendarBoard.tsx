import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type ApprovalStatus = 'pendente' | 'aprovado' | 'reprovado';

type StoryReview = { status: ApprovalStatus; feedback: string };

type DBItem = {
  id: string;
  post_date: string;
  day_label: string;
  title: string;
  format: string;
  pillar: string;
  theme: string;
  objective: string;
  caption: string;
  stories: string[];
  post_status: ApprovalStatus;
  post_feedback: string;
  stories_reviews: StoryReview[];
};

function statusClasses(status: ApprovalStatus) {
  if (status === 'aprovado') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (status === 'reprovado') return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
  return 'bg-white/5 text-white/70 border-white/10';
}

function storyReview(item: DBItem, idx: number): StoryReview {
  return item.stories_reviews?.[idx] ?? { status: 'pendente', feedback: '' };
}

export default function ContentCalendarBoard({ slug, adminMode = false }: { slug: string; adminMode?: boolean }) {
  const [items, setItems] = useState<DBItem[]>([]);
  const [weekLabel, setWeekLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<'todos' | 'reels' | 'post-estatico' | 'carrossel' | 'stories'>('todos');

  // Reject modal
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ itemId: string; type: 'post' | 'story'; storyIndex?: number } | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      setLoading(true);

      const { data: calendar } = await supabase
        .from('content_calendars')
        .select('id,week_start,week_end')
        .eq('slug', slug)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (calendar?.id) {
        const { data } = await supabase
          .from('content_calendar_items')
          .select('*')
          .eq('calendar_id', calendar.id)
          .order('post_date', { ascending: true });

        if (data?.length) {
          setItems(data.map((it: any) => ({
            id: it.id,
            post_date: it.post_date,
            day_label: it.day_label,
            title: it.title,
            format: it.format || 'Post',
            pillar: it.pillar || '-',
            theme: it.theme || '-',
            objective: it.objective || '-',
            caption: it.caption || '-',
            stories: Array.isArray(it.stories) ? it.stories : [],
            post_status: (it.post_status as ApprovalStatus) || 'pendente',
            post_feedback: it.post_feedback || '',
            stories_reviews: Array.isArray(it.stories_reviews)
              ? it.stories_reviews
              : [],
          })));
          setWeekLabel(`${calendar.week_start} a ${calendar.week_end}`);
        }
      }

      setLoading(false);
    };
    load();
  }, [slug]);

  /* ── helpers ─────────────────────────────────────────────────── */

  const patch = (id: string, changes: Partial<DBItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...changes } : it));
  };

  const persist = async (id: string, changes: object) => {
    if (!supabase) { console.error('Supabase não configurado'); return; }
    setSavingId(id);
    const { error } = await supabase
      .from('content_calendar_items')
      .update(changes)
      .eq('id', id);
    setSavingId(null);
    if (error) console.error('Erro ao salvar:', error.message);
  };

  /* ── post actions ─────────────────────────────────────────────── */

  const approvePost = (item: DBItem) => {
    const changes = { post_status: 'aprovado' as ApprovalStatus, post_feedback: '' };
    patch(item.id, changes);
    persist(item.id, changes);
  };

  const resetPost = (item: DBItem) => {
    const changes = { post_status: 'pendente' as ApprovalStatus, post_feedback: '' };
    patch(item.id, changes);
    persist(item.id, changes);
  };

  /* ── story actions ────────────────────────────────────────────── */

  const approveStory = (item: DBItem, idx: number) => {
    const reviews = [...(item.stories_reviews || [])];
    reviews[idx] = { status: 'aprovado', feedback: '' };
    patch(item.id, { stories_reviews: reviews });
    persist(item.id, { stories_reviews: reviews });
  };

  const resetStory = (item: DBItem, idx: number) => {
    const reviews = [...(item.stories_reviews || [])];
    reviews[idx] = { status: 'pendente', feedback: '' };
    patch(item.id, { stories_reviews: reviews });
    persist(item.id, { stories_reviews: reviews });
  };

  /* ── reject modal ─────────────────────────────────────────────── */

  const openReject = (itemId: string, type: 'post' | 'story', storyIndex?: number) => {
    const item = items.find(it => it.id === itemId);
    if (!item) return;
    setRejectTarget({ itemId, type, storyIndex });
    setFeedback(
      type === 'post'
        ? item.post_feedback
        : storyReview(item, storyIndex!).feedback
    );
    setModalOpen(true);
  };

  const confirmReject = () => {
    if (!feedback.trim() || !rejectTarget) return;
    const item = items.find(it => it.id === rejectTarget.itemId);
    if (!item) return;

    if (rejectTarget.type === 'post') {
      const changes = { post_status: 'reprovado' as ApprovalStatus, post_feedback: feedback.trim() };
      patch(item.id, changes);
      persist(item.id, changes);
    } else {
      const reviews = [...(item.stories_reviews || [])];
      reviews[rejectTarget.storyIndex!] = { status: 'reprovado', feedback: feedback.trim() };
      patch(item.id, { stories_reviews: reviews });
      persist(item.id, { stories_reviews: reviews });
    }

    setModalOpen(false);
    setFeedback('');
    setRejectTarget(null);
  };

  /* ── filtered lists ───────────────────────────────────────────── */

  const visibleItems = useMemo(() => {
    if (formatFilter === 'todos' || formatFilter === 'stories') return items;
    if (formatFilter === 'reels') return items.filter(it => it.format.toLowerCase().includes('reels'));
    if (formatFilter === 'carrossel') return items.filter(it => it.format.toLowerCase().includes('carrossel'));
    return items.filter(it => it.format.toLowerCase().includes('post'));
  }, [items, formatFilter]);

  const storiesCards = useMemo(
    () => items.flatMap(item => item.stories.map((story, idx) => ({ item, story, idx }))),
    [items]
  );

  /* ── shared button helpers ────────────────────────────────────── */

  const btnAprove = (onClick: () => void, disabled: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 px-2 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
    >
      Aprovar
    </button>
  );

  const btnReject = (onClick: () => void, disabled: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 px-2 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs hover:bg-rose-500/20 transition-colors disabled:opacity-40"
    >
      Reprovar
    </button>
  );

  const btnReset = (onClick: () => void, disabled: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1.5 rounded-lg border border-white/20 text-xs hover:bg-white/5 transition-colors disabled:opacity-40"
    >
      Reset
    </button>
  );

  /* ── render ───────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Calendário de Conteúdo</div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              {slug} {weekLabel && <span className="text-white/60 text-2xl md:text-3xl font-normal">— Semana {weekLabel}</span>}
            </h1>
            <p className="text-white/50 mt-2 text-sm">
              Aprovações salvas em tempo real no banco de dados.
            </p>
          </div>
          {adminMode && (
            <Link
              to="/admin/calendarios"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Calendários
            </Link>
          )}
        </div>

        {/* Format filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'reels', label: 'Reels' },
            { key: 'carrossel', label: 'Carrossel' },
            { key: 'post-estatico', label: 'Post Estático' },
            { key: 'stories', label: 'Stories' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFormatFilter(f.key as typeof formatFilter)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${formatFilter === f.key
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                : 'border-white/20 text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando calendário...
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center py-20 border border-white/5 rounded-2xl text-white/40">
            Este calendário ainda não tem conteúdos.
            {adminMode && (
              <div className="mt-4">
                <Link to="/admin/calendarios" className="text-accent-cyan underline text-sm">
                  Adicionar conteúdos →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Stories view */}
        {formatFilter === 'stories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {storiesCards.map(({ item, story, idx }) => {
              const sr = storyReview(item, idx);
              const busy = savingId === item.id;
              return (
                <article key={`${item.id}-s${idx}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-cyan-300/70">{item.day_label}</p>
                      <h2 className="text-sm font-semibold mt-1">{item.title}</h2>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full border border-white/20 bg-white/5 shrink-0">{item.post_date}</span>
                  </div>

                  <div className="border border-white/10 rounded-lg p-3 bg-black/30 flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/70">Story {idx + 1}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(sr.status)}`}>{sr.status}</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed flex-1 whitespace-pre-wrap">{story}</p>
                    {sr.feedback && (
                      <p className="text-xs text-rose-300 border-l-2 border-rose-500/40 pl-2">
                        {sr.feedback}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {btnAprove(() => approveStory(item, idx), busy)}
                      {btnReject(() => openReject(item.id, 'story', idx), busy)}
                      {btnReset(() => resetStory(item, idx), busy)}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Posts view */}
        {formatFilter !== 'stories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {visibleItems.map(item => {
              const busy = savingId === item.id;
              return (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
                  {/* Post header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-widest text-cyan-300/70">{item.day_label}</p>
                      <h2 className="text-lg font-semibold mt-1 leading-snug">{item.title}</h2>
                      <p className="text-xs text-white/40 mt-1">{item.format} · {item.pillar}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs px-2 py-1 rounded-full border border-white/20 bg-white/5">{item.post_date}</span>
                      {busy && <Loader2 className="w-3 h-3 animate-spin text-white/30" />}
                    </div>
                  </div>

                  {/* Admin metadata */}
                  {adminMode && (
                    <div className="text-xs text-white/40 border border-white/5 rounded-lg p-2.5 bg-white/[0.02] space-y-1">
                      <div><span className="text-white/25">Tema:</span> {item.theme}</div>
                      <div><span className="text-white/25">Objetivo:</span> {item.objective}</div>
                    </div>
                  )}

                  {/* Post section */}
                  <section className="border border-white/10 rounded-xl p-3 bg-black/20 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Post do dia</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(item.post_status)}`}>
                        {item.post_status}
                      </span>
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{item.caption}</p>
                    {item.post_feedback && (
                      <p className="text-xs text-rose-300 border-l-2 border-rose-500/40 pl-2">
                        {item.post_feedback}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => approvePost(item)}
                        disabled={busy}
                        className="flex-1 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => openReject(item.id, 'post')}
                        disabled={busy}
                        className="flex-1 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm hover:bg-rose-500/20 transition-colors disabled:opacity-40"
                      >
                        Reprovar
                      </button>
                      <button
                        onClick={() => resetPost(item)}
                        disabled={busy}
                        className="px-3 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/5 transition-colors disabled:opacity-40"
                      >
                        Reset
                      </button>
                    </div>
                  </section>

                  {/* Stories section */}
                  {item.stories.length > 0 && (
                    <section className="border border-white/10 rounded-xl p-3 bg-black/20">
                      <h3 className="text-sm font-semibold mb-3">
                        Stories ({item.stories.length})
                      </h3>
                      <div className="space-y-2">
                        {item.stories.map((story, idx) => {
                          const sr = storyReview(item, idx);
                          return (
                            <div key={idx} className="border border-white/10 rounded-lg p-3 bg-black/30">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-white/70">Story {idx + 1}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(sr.status)}`}>
                                  {sr.status}
                                </span>
                              </div>
                              <p className="text-xs text-white/55 leading-relaxed mb-2 whitespace-pre-wrap">{story}</p>
                              {sr.feedback && (
                                <p className="text-xs text-rose-300 border-l-2 border-rose-500/40 pl-2 mb-2">
                                  {sr.feedback}
                                </p>
                              )}
                              <div className="flex gap-2">
                                {btnAprove(() => approveStory(item, idx), busy)}
                                {btnReject(() => openReject(item.id, 'story', idx), busy)}
                                {btnReset(() => resetStory(item, idx), busy)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {modalOpen && rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0B0B0B] p-6">
            <h3 className="text-lg font-bold mb-1">Direcionamento da reprovação</h3>
            <p className="text-sm text-white/50 mb-4">
              {rejectTarget.type === 'post'
                ? 'Post do dia'
                : `Story ${(rejectTarget.storyIndex ?? 0) + 1}`}
            </p>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-white/20 bg-black/40 p-3 text-sm focus:outline-none focus:border-white/40 resize-none"
              placeholder="Explique exatamente o ajuste necessário..."
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                disabled={!feedback.trim()}
                className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 text-sm hover:bg-rose-500/30 transition-colors disabled:opacity-40"
              >
                Salvar reprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
