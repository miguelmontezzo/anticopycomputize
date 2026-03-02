import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { computoCalendarPosts, computoWeekLabel, type ApprovalStatus } from '../data/computoCalendar';

type ReviewItem = {
  postStatus: ApprovalStatus;
  postFeedback?: string;
  storiesStatus: ApprovalStatus;
  storiesFeedback?: string;
};

type ReviewMap = Record<string, ReviewItem>;

type RejectTarget = 'post' | 'stories';

const STORAGE_PREFIX = 'anticopy.calendar.reviews';

const defaultReview: ReviewItem = {
  postStatus: 'pendente',
  storiesStatus: 'pendente',
};

function statusClasses(status: ApprovalStatus) {
  if (status === 'aprovado') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (status === 'reprovado') return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
  return 'bg-white/5 text-white/70 border-white/10';
}

export default function ContentCalendarBoard({ slug, adminMode = false }: { slug: string; adminMode?: boolean }) {
  const storageKey = `${STORAGE_PREFIX}.${slug}`;
  const posts = useMemo(() => computoCalendarPosts, []);
  const [formatFilter, setFormatFilter] = useState<'todos' | 'reels' | 'post-estatico' | 'carrossel'>('todos');

  const visiblePosts = useMemo(() => {
    if (formatFilter === 'todos') return posts;
    if (formatFilter === 'reels') return posts.filter((p) => p.format.toLowerCase().includes('reels'));
    if (formatFilter === 'carrossel') return posts.filter((p) => p.format.toLowerCase().includes('carrossel'));
    return posts.filter((p) => p.format.toLowerCase().includes('post'));
  }, [posts, formatFilter]);

  const [reviews, setReviews] = useState<ReviewMap>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}') as ReviewMap;
    } catch {
      return {};
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [rejectDate, setRejectDate] = useState<string>('');
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>('post');
  const [feedback, setFeedback] = useState('');

  const save = (next: ReviewMap) => {
    setReviews(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const current = (date: string): ReviewItem => reviews[date] || defaultReview;

  const approve = (date: string, target: RejectTarget) => {
    const c = current(date);
    const updated: ReviewItem =
      target === 'post'
        ? { ...c, postStatus: 'aprovado', postFeedback: '' }
        : { ...c, storiesStatus: 'aprovado', storiesFeedback: '' };
    save({ ...reviews, [date]: updated });
  };

  const reset = (date: string, target: RejectTarget) => {
    const c = current(date);
    const updated: ReviewItem =
      target === 'post'
        ? { ...c, postStatus: 'pendente', postFeedback: '' }
        : { ...c, storiesStatus: 'pendente', storiesFeedback: '' };
    save({ ...reviews, [date]: updated });
  };

  const openRejectModal = (date: string, target: RejectTarget) => {
    setRejectDate(date);
    setRejectTarget(target);
    const c = current(date);
    setFeedback(target === 'post' ? c.postFeedback || '' : c.storiesFeedback || '');
    setModalOpen(true);
  };

  const confirmReject = () => {
    if (!feedback.trim()) return;
    const c = current(rejectDate);
    const updated: ReviewItem =
      rejectTarget === 'post'
        ? { ...c, postStatus: 'reprovado', postFeedback: feedback.trim() }
        : { ...c, storiesStatus: 'reprovado', storiesFeedback: feedback.trim() };
    save({ ...reviews, [rejectDate]: updated });
    setModalOpen(false);
    setFeedback('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Calendário de Conteúdo</div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{slug} — Semana {computoWeekLabel}</h1>
            <p className="text-white/60 mt-3 max-w-3xl">Visualize por data, aprove/reprove separado para post e stories.</p>
          </div>
          {!adminMode ? (
            <Link to={`/${slug}/ia-service`} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Voltar</Link>
          ) : (
            <span className="px-4 py-2 rounded-lg border border-cyan-400/30 text-cyan-300 text-sm">Modo Admin</span>
          )}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'reels', label: 'Reels' },
            { key: 'carrossel', label: 'Carrossel' },
            { key: 'post-estatico', label: 'Post Estático' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFormatFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-full border text-sm ${formatFilter === f.key ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-white/20 text-white/70'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {visiblePosts.map((post) => {
            const r = current(post.date);
            return (
              <article key={post.date} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-cyan-300/80">{post.dayLabel}</p>
                    <h2 className="text-xl font-semibold mt-1">{post.title}</h2>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">{post.date}</span>
                </div>

                <div className="text-sm text-white/80 space-y-1">
                  <p><strong>Formato:</strong> {post.format}</p>
                  <p><strong>Pilar:</strong> {post.pillar}</p>
                  <p><strong>Tema:</strong> {post.theme}</p>
                </div>

                <section className="border border-white/10 rounded-xl p-3 bg-black/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Post do dia</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(r.postStatus)}`}>{r.postStatus}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-3">{post.caption}</p>
                  {r.postFeedback && <p className="text-xs text-rose-200 mb-2">Direcionamento: {r.postFeedback}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => approve(post.date, 'post')} className="flex-1 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm">Aprovar</button>
                    <button onClick={() => openRejectModal(post.date, 'post')} className="flex-1 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm">Reprovar</button>
                    <button onClick={() => reset(post.date, 'post')} className="px-3 py-2 rounded-lg border border-white/20 text-sm">Reset</button>
                  </div>
                </section>

                <section className="border border-white/10 rounded-xl p-3 bg-black/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Stories do dia</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(r.storiesStatus)}`}>{r.storiesStatus}</span>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-white/70 space-y-1 mb-3">
                    {post.stories.map((story) => <li key={story}>{story}</li>)}
                  </ul>
                  {r.storiesFeedback && <p className="text-xs text-rose-200 mb-2">Direcionamento: {r.storiesFeedback}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => approve(post.date, 'stories')} className="flex-1 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm">Aprovar</button>
                    <button onClick={() => openRejectModal(post.date, 'stories')} className="flex-1 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm">Reprovar</button>
                    <button onClick={() => reset(post.date, 'stories')} className="px-3 py-2 rounded-lg border border-white/20 text-sm">Reset</button>
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0B0B0B] p-5">
            <h3 className="text-lg font-bold mb-2">Direcionamento da reprovação</h3>
            <p className="text-sm text-white/60 mb-3">{rejectDate} · {rejectTarget === 'post' ? 'Post' : 'Stories'}</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-white/20 bg-black/40 p-3 text-sm"
              placeholder="Explique exatamente o ajuste necessário..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-white/20">Cancelar</button>
              <button onClick={confirmReject} className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200">Salvar reprovação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
