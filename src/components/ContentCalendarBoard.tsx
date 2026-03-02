import React, { useMemo, useState } from 'react';
import { computoCalendarPosts, computoWeekLabel, type ApprovalStatus } from '../data/computoCalendar';

type StoryReview = { status: ApprovalStatus; feedback?: string };

type ReviewItem = {
  postStatus: ApprovalStatus;
  postFeedback?: string;
  stories: StoryReview[];
};

type ReviewMap = Record<string, ReviewItem>;
type RejectTarget = 'post' | 'story';

const STORAGE_PREFIX = 'anticopy.calendar.reviews';

function statusClasses(status: ApprovalStatus) {
  if (status === 'aprovado') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (status === 'reprovado') return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
  return 'bg-white/5 text-white/70 border-white/10';
}

export default function ContentCalendarBoard({ slug, adminMode = false }: { slug: string; adminMode?: boolean }) {
  const storageKey = `${STORAGE_PREFIX}.${slug}`;
  const posts = useMemo(() => computoCalendarPosts, []);
  const [formatFilter, setFormatFilter] = useState<'todos' | 'reels' | 'post-estatico' | 'carrossel' | 'stories'>('todos');

  const visiblePosts = useMemo(() => {
    if (formatFilter === 'todos' || formatFilter === 'stories') return posts;
    if (formatFilter === 'reels') return posts.filter((p) => p.format.toLowerCase().includes('reels'));
    if (formatFilter === 'carrossel') return posts.filter((p) => p.format.toLowerCase().includes('carrossel'));
    return posts.filter((p) => p.format.toLowerCase().includes('post'));
  }, [posts, formatFilter]);

  const storiesOnlyCards = useMemo(() => {
    return posts.flatMap((post) =>
      post.stories.map((story, idx) => ({
        date: post.date,
        dayLabel: post.dayLabel,
        postTitle: post.title,
        story,
        idx,
        storiesCount: post.stories.length,
      }))
    );
  }, [posts]);

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
  const [rejectStoryIndex, setRejectStoryIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const save = (next: ReviewMap) => {
    setReviews(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const current = (date: string, storiesCount: number): ReviewItem => {
    const existing = reviews[date];
    if (!existing) return { postStatus: 'pendente', stories: Array.from({ length: storiesCount }, () => ({ status: 'pendente' as ApprovalStatus })) };
    const stories = Array.from({ length: storiesCount }, (_, i) => existing.stories?.[i] || { status: 'pendente' as ApprovalStatus });
    return { ...existing, stories };
  };

  const approvePost = (date: string, storiesCount: number) => {
    const c = current(date, storiesCount);
    save({ ...reviews, [date]: { ...c, postStatus: 'aprovado', postFeedback: '' } });
  };

  const resetPost = (date: string, storiesCount: number) => {
    const c = current(date, storiesCount);
    save({ ...reviews, [date]: { ...c, postStatus: 'pendente', postFeedback: '' } });
  };

  const approveStory = (date: string, storiesCount: number, idx: number) => {
    const c = current(date, storiesCount);
    const nextStories = [...c.stories];
    nextStories[idx] = { status: 'aprovado' };
    save({ ...reviews, [date]: { ...c, stories: nextStories } });
  };

  const resetStory = (date: string, storiesCount: number, idx: number) => {
    const c = current(date, storiesCount);
    const nextStories = [...c.stories];
    nextStories[idx] = { status: 'pendente' };
    save({ ...reviews, [date]: { ...c, stories: nextStories } });
  };

  const openRejectModal = (date: string, target: RejectTarget, storiesCount: number, storyIndex?: number) => {
    const c = current(date, storiesCount);
    setRejectDate(date);
    setRejectTarget(target);
    if (target === 'story' && typeof storyIndex === 'number') {
      setRejectStoryIndex(storyIndex);
      setFeedback(c.stories[storyIndex]?.feedback || '');
    } else {
      setRejectStoryIndex(null);
      setFeedback(c.postFeedback || '');
    }
    setModalOpen(true);
  };

  const confirmReject = () => {
    if (!feedback.trim()) return;
    const sourcePost = posts.find((p) => p.date === rejectDate);
    if (!sourcePost) return;
    const c = current(rejectDate, sourcePost.stories.length);

    if (rejectTarget === 'post') {
      save({ ...reviews, [rejectDate]: { ...c, postStatus: 'reprovado', postFeedback: feedback.trim() } });
    } else if (rejectStoryIndex !== null) {
      const nextStories = [...c.stories];
      nextStories[rejectStoryIndex] = { status: 'reprovado', feedback: feedback.trim() };
      save({ ...reviews, [rejectDate]: { ...c, stories: nextStories } });
    }

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
            <p className="text-white/60 mt-3 max-w-3xl">Visualize por data e aprove/reprove post + cada story em cards separados.</p>
          </div>
          {adminMode && (
            <span className="px-4 py-2 rounded-lg border border-cyan-400/30 text-cyan-300 text-sm">Modo Admin</span>
          )}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'reels', label: 'Reels' },
            { key: 'carrossel', label: 'Carrossel' },
            { key: 'post-estatico', label: 'Post Estático' },
            { key: 'stories', label: 'Stories' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFormatFilter(f.key as any)} className={`px-3 py-1.5 rounded-full border text-sm ${formatFilter === f.key ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-white/20 text-white/70'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {formatFilter === 'stories' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {storiesOnlyCards.map((card) => {
              const r = current(card.date, card.storiesCount);
              const sr = r.stories[card.idx] || { status: 'pendente' as ApprovalStatus };
              return (
                <article key={`${card.date}-${card.idx}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-cyan-300/80">{card.dayLabel}</p>
                      <h2 className="text-base font-semibold mt-1">{card.postTitle}</h2>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">{card.date}</span>
                  </div>
                  <div className="border border-white/10 rounded-lg p-3 bg-black/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-white/80">Story {card.idx + 1}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(sr.status)}`}>{sr.status}</span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">{card.story}</p>
                    {sr.feedback && <p className="text-xs text-rose-200 mb-2">Direcionamento: {sr.feedback}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => approveStory(card.date, card.storiesCount, card.idx)} className="flex-1 px-2 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs">Aprovar</button>
                      <button onClick={() => openRejectModal(card.date, 'story', card.storiesCount, card.idx)} className="flex-1 px-2 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs">Reprovar</button>
                      <button onClick={() => resetStory(card.date, card.storiesCount, card.idx)} className="px-2 py-1.5 rounded-lg border border-white/20 text-xs">Reset</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {visiblePosts.map((post) => {
              const r = current(post.date, post.stories.length);
              return (
                <article key={post.date} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-cyan-300/80">{post.dayLabel}</p>
                      <h2 className="text-xl font-semibold mt-1">{post.title}</h2>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">{post.date}</span>
                  </div>

                  <section className="border border-white/10 rounded-xl p-3 bg-black/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">Post do dia</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(r.postStatus)}`}>{r.postStatus}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed mb-3">{post.caption}</p>
                    {r.postFeedback && <p className="text-xs text-rose-200 mb-2">Direcionamento: {r.postFeedback}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => approvePost(post.date, post.stories.length)} className="flex-1 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm">Aprovar</button>
                      <button onClick={() => openRejectModal(post.date, 'post', post.stories.length)} className="flex-1 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm">Reprovar</button>
                      <button onClick={() => resetPost(post.date, post.stories.length)} className="px-3 py-2 rounded-lg border border-white/20 text-sm">Reset</button>
                    </div>
                  </section>

                  <section className="border border-white/10 rounded-xl p-3 bg-black/20">
                    <h3 className="text-sm font-semibold mb-3">Stories do dia (cards separados)</h3>
                    <div className="space-y-2">
                      {post.stories.map((story, idx) => {
                        const sr = r.stories[idx] || { status: 'pendente' as ApprovalStatus };
                        return (
                          <div key={story} className="border border-white/10 rounded-lg p-3 bg-black/30">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-white/80">Story {idx + 1}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses(sr.status)}`}>{sr.status}</span>
                            </div>
                            <p className="text-sm text-white/70 mb-2">{story}</p>
                            {sr.feedback && <p className="text-xs text-rose-200 mb-2">Direcionamento: {sr.feedback}</p>}
                            <div className="flex gap-2">
                              <button onClick={() => approveStory(post.date, post.stories.length, idx)} className="flex-1 px-2 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs">Aprovar</button>
                              <button onClick={() => openRejectModal(post.date, 'story', post.stories.length, idx)} className="flex-1 px-2 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs">Reprovar</button>
                              <button onClick={() => resetStory(post.date, post.stories.length, idx)} className="px-2 py-1.5 rounded-lg border border-white/20 text-xs">Reset</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0B0B0B] p-5">
            <h3 className="text-lg font-bold mb-2">Direcionamento da reprovação</h3>
            <p className="text-sm text-white/60 mb-3">
              {rejectDate} · {rejectTarget === 'post' ? 'Post' : `Story ${rejectStoryIndex !== null ? rejectStoryIndex + 1 : ''}`}
            </p>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full min-h-[120px] rounded-xl border border-white/20 bg-black/40 p-3 text-sm" placeholder="Explique exatamente o ajuste necessário..." />
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
