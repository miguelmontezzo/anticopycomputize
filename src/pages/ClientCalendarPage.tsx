import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { computoCalendarPosts, computoWeekLabel, type ApprovalStatus } from '../data/computoCalendar';

type ApprovalMap = Record<string, ApprovalStatus>;

const STORAGE_PREFIX = 'anticopy.calendar.approvals';

function statusClasses(status: ApprovalStatus) {
  if (status === 'aprovado') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (status === 'reprovado') return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
  return 'bg-white/5 text-white/70 border-white/10';
}

export default function ClientCalendarPage() {
  const { slug = '' } = useParams();
  const storageKey = `${STORAGE_PREFIX}.${slug}`;

  const [approvals, setApprovals] = useState<ApprovalMap>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}') as ApprovalMap;
    } catch {
      return {};
    }
  });

  const posts = useMemo(() => computoCalendarPosts, []);

  const setStatus = (date: string, status: ApprovalStatus) => {
    const next = { ...approvals, [date]: status };
    setApprovals(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Calendário de Conteúdo</div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Computo — Semana {computoWeekLabel}</h1>
            <p className="text-white/60 mt-3 max-w-3xl">
              Clique em <strong>Aprovar</strong> ou <strong>Reprovar</strong> em cada post para validar com o cliente.
            </p>
          </div>
          <Link to={`/${slug}/ia-service`} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">
            Voltar para apresentação
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const status = approvals[post.date] || 'pendente';
            return (
              <article key={post.date} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-cyan-300/80">{post.dayLabel}</p>
                    <h2 className="text-xl font-semibold mt-1">{post.title}</h2>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${statusClasses(status)}`}>{status}</span>
                </div>

                <div className="text-sm text-white/80 space-y-1">
                  <p><strong>Formato:</strong> {post.format}</p>
                  <p><strong>Pilar:</strong> {post.pillar}</p>
                  <p><strong>Tema:</strong> {post.theme}</p>
                </div>

                <p className="text-sm text-white/70 leading-relaxed">{post.objective}</p>

                <div>
                  <h3 className="text-sm font-semibold mb-2 text-white/90">Legenda sugerida</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{post.caption}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2 text-white/90">Stories do dia</h3>
                  <ul className="list-disc pl-5 text-sm text-white/70 space-y-1">
                    {post.stories.map((story) => <li key={story}>{story}</li>)}
                  </ul>
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                  <button onClick={() => setStatus(post.date, 'aprovado')} className="flex-1 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 text-sm">Aprovar</button>
                  <button onClick={() => setStatus(post.date, 'reprovado')} className="flex-1 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-sm">Reprovar</button>
                  <button onClick={() => setStatus(post.date, 'pendente')} className="px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-sm">Reset</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
