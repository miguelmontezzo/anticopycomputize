import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CalendarDays, Plus, Copy, Check, Edit2, Trash2, X, Upload } from 'lucide-react';

type Client = { id: string; name: string };
type Calendar = { id: string; slug: string; title: string; week_start: string; week_end: string; status: string; client_id: string };
type CalendarItem = {
  id: string;
  calendar_id: string;
  post_date: string;
  day_label: string;
  title: string;
  format: string;
  pillar: string;
  theme: string;
  objective: string;
  caption: string;
  stories: string[];
};

type ParsedItem = Omit<CalendarItem, 'id' | 'calendar_id'>;

const emptyItem = { post_date: '', day_label: '', title: '', format: '', pillar: '', theme: '', objective: '', caption: '', storiesText: '' };

function toIsoDateFromBR(raw?: string) {
  if (!raw) return '';
  const m = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function parseCalendarText(text: string): ParsedItem[] {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/POST\s*\d+/i.test(line) && /\(/.test(line)) {
      if (current.length) blocks.push(current);
      current = [line];
    } else if (current.length) {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);

  return blocks.map((b) => {
    const head = b[0] || '';
    const dayLabel = (head.match(/—\s*([^(]+)/)?.[1] || '').trim();
    const date = toIsoDateFromBR(head.match(/\((\d{2}\/\d{2}\/\d{4})\)/)?.[1]);
    const title = (head.match(/POST\s*\d+\s*—\s*(.+)$/i)?.[1] || head).trim();

    const getAfter = (prefix: string) => (b.find(l => l.toLowerCase().startsWith(prefix.toLowerCase())) || '').replace(new RegExp(`^${prefix}\s*:??\s*`, 'i'), '').trim();
    const format = getAfter('Formato');
    const pillar = getAfter('Pilar');
    const theme = getAfter('Tema');

    const captionIdx = b.findIndex(l => /copy\s+da\s+legenda|legenda\s+sugerida/i.test(l));
    const storiesIdx = b.findIndex(l => /stories/i.test(l));

    const caption = captionIdx >= 0
      ? b.slice(captionIdx + 1, storiesIdx > captionIdx ? storiesIdx : b.length).filter(Boolean).join(' ')
      : '';

    const stories = b
      .slice(storiesIdx >= 0 ? storiesIdx + 1 : 0)
      .filter(l => /story\s*\d+/i.test(l) || /^\d+[\).\-]/.test(l))
      .map(l => l.replace(/^\d+[\).\-]\s*/, '').trim());

    return {
      post_date: date,
      day_label: dayLabel || 'Dia da semana',
      title,
      format: format || 'Post',
      pillar: pillar || '-',
      theme: theme || '-',
      objective: '-',
      caption: caption || '-',
      stories,
    };
  }).filter(i => i.post_date && i.title);
}

export default function AdminCalendarsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Calendar[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ client_id: '', slug: '', title: '', week_start: '', week_end: '' });

  const [parsedCreateItems, setParsedCreateItems] = useState<ParsedItem[]>([]);
  const [parsedAppendItems, setParsedAppendItems] = useState<ParsedItem[]>([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<any>(emptyItem);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: '', title: '' });

  const load = async () => {
    const [cRes, iRes] = await Promise.all([
      supabase.from('clients').select('id,name').order('name', { ascending: true }),
      supabase.from('content_calendars').select('*').order('created_at', { ascending: false }),
    ]);
    if (cRes.data) setClients(cRes.data as Client[]);
    if (iRes.data) setItems(iRes.data as Calendar[]);
  };

  useEffect(() => { load(); }, []);

  const loadCalendarItems = async (calendarId: string) => {
    const { data } = await supabase.from('content_calendar_items').select('*').eq('calendar_id', calendarId).order('post_date', { ascending: true });
    setCalendarItems((data || []) as CalendarItem[]);
  };

  const handleFileParse = async (file: File, mode: 'create' | 'append') => {
    const ext = file.name.toLowerCase();
    if (!(ext.endsWith('.md') || ext.endsWith('.txt'))) {
      alert('Por enquanto o importador aceita .md e .txt.');
      return;
    }
    const text = await file.text();
    const parsed = parseCalendarText(text);
    if (!parsed.length) {
      alert('Não consegui identificar posts no arquivo. Use o padrão: POST X — DIA (dd/mm/aaaa).');
      return;
    }
    if (mode === 'create') setParsedCreateItems(parsed);
    else setParsedAppendItems(parsed);
  };

  const createCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.slug || !form.title || !form.week_start || !form.week_end) return;
    const { data, error } = await supabase.from('content_calendars').insert([{ ...form, status: 'active' }]).select().single();
    if (error) return alert(error.message);

    if (parsedCreateItems.length && data?.id) {
      const payload = parsedCreateItems.map((p) => ({ ...p, calendar_id: data.id }));
      const ins = await supabase.from('content_calendar_items').insert(payload);
      if (ins.error) alert(`Calendário criado, mas falhou ao inserir itens: ${ins.error.message}`);
    }

    setForm({ client_id: '', slug: '', title: '', week_start: '', week_end: '' });
    setParsedCreateItems([]);
    load();
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendar) return;
    const payload = {
      calendar_id: selectedCalendar.id,
      post_date: itemForm.post_date,
      day_label: itemForm.day_label,
      title: itemForm.title,
      format: itemForm.format,
      pillar: itemForm.pillar,
      theme: itemForm.theme,
      objective: itemForm.objective,
      caption: itemForm.caption,
      stories: itemForm.storiesText.split('\n').map((s: string) => s.trim()).filter(Boolean),
    };

    const result = editingItemId
      ? await supabase.from('content_calendar_items').update(payload).eq('id', editingItemId)
      : await supabase.from('content_calendar_items').insert([payload]);

    if (result.error) return alert(result.error.message);
    setItemForm(emptyItem);
    setEditingItemId(null);
    loadCalendarItems(selectedCalendar.id);
  };

  const appendParsedItems = async () => {
    if (!selectedCalendar || !parsedAppendItems.length) return;
    const payload = parsedAppendItems.map((p) => ({ ...p, calendar_id: selectedCalendar.id }));
    const { error } = await supabase.from('content_calendar_items').insert(payload);
    if (error) return alert(error.message);
    setParsedAppendItems([]);
    loadCalendarItems(selectedCalendar.id);
  };

  const editItem = (it: CalendarItem) => {
    setEditingItemId(it.id);
    setItemForm({
      post_date: it.post_date,
      day_label: it.day_label,
      title: it.title,
      format: it.format,
      pillar: it.pillar,
      theme: it.theme,
      objective: it.objective,
      caption: it.caption,
      storiesText: (it.stories || []).join('\n'),
    });
  };

  const removeItem = async (id: string) => {
    await supabase.from('content_calendar_items').delete().eq('id', id);
    if (selectedCalendar) loadCalendarItems(selectedCalendar.id);
  };

  const removeCalendar = async () => {
    await supabase.from('content_calendars').delete().eq('id', deleteModal.id);
    setDeleteModal({ open: false, id: '', title: '' });
    load();
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="p-6 md:p-12 text-white">
      <header className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 flex items-center gap-3"><CalendarDays className="w-8 h-8 text-accent-cyan" /> Calendários</h1>
        <p className="text-muted">Crie, edite e exclua calendários e conteúdos. Importador integrado (.md/.txt).</p>
      </header>

      <form onSubmit={createCalendar} className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <select value={form.client_id} onChange={(e) => setForm(s => ({ ...s, client_id: e.target.value }))} className="bg-black/40 border border-white/10 rounded-xl p-3" required>
          <option value="">Cliente...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.slug} onChange={(e) => setForm(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="slug (ex: computize)" className="bg-black/40 border border-white/10 rounded-xl p-3" required />
        <input value={form.title} onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))} placeholder="Título do calendário" className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2" required />
        <input type="date" value={form.week_start} onChange={(e) => setForm(s => ({ ...s, week_start: e.target.value }))} className="bg-black/40 border border-white/10 rounded-xl p-3" required />
        <input type="date" value={form.week_end} onChange={(e) => setForm(s => ({ ...s, week_end: e.target.value }))} className="bg-black/40 border border-white/10 rounded-xl p-3" required />

        <label className="md:col-span-2 border border-white/10 rounded-xl p-3 text-sm flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" /> Importar arquivo para estrutura inicial (.md/.txt)
          <input type="file" accept=".md,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileParse(e.target.files[0], 'create')} />
        </label>
        {parsedCreateItems.length > 0 && <div className="md:col-span-2 text-xs text-cyan-300">{parsedCreateItems.length} conteúdos prontos para criar junto com o calendário.</div>}

        <button className="md:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan/20 border border-accent-cyan/30 rounded-xl"><Plus className="w-4 h-4" /> Criar novo calendário</button>
      </form>

      <div className="grid gap-4">
        {items.map((item) => {
          const pub = `${window.location.origin}/calendario/${item.slug}`;
          const adm = `${window.location.origin}/admin/calendario/${item.slug}`;
          return (
            <div key={item.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-lg">{item.title} <span className="text-xs text-muted">/{item.slug}</span></h3>
                  <p className="text-sm text-muted">{item.week_start} → {item.week_end}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedCalendar(item); setEditorOpen(true); loadCalendarItems(item.id); }} className="px-3 py-2 rounded-lg border border-white/20 text-sm inline-flex items-center gap-2"><Edit2 className="w-4 h-4" /> Editar conteúdos</button>
                  <button onClick={() => setDeleteModal({ open: true, id: item.id, title: item.title })} className="px-3 py-2 rounded-lg border border-red-500/30 text-red-300 text-sm inline-flex items-center gap-2"><Trash2 className="w-4 h-4" /> Excluir</button>
                </div>
              </div>
              <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs">
                {[{ label: 'Link público', url: pub }, { label: 'Link admin', url: adm }].map(r => (
                  <div key={r.url} className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between">
                    <span>{r.label}</span>
                    <button onClick={() => copy(r.url)}>{copied === r.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editorOpen && selectedCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setEditorOpen(false)} />
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0B0B0B] p-5">
            <button onClick={() => setEditorOpen(false)} className="absolute top-3 right-3 p-2 rounded-full bg-white/10"><X className="w-4 h-4" /></button>
            <h3 className="text-xl font-bold mb-4">Editar conteúdos — {selectedCalendar.title}</h3>

            <label className="mb-4 border border-white/10 rounded-xl p-3 text-sm flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Importar arquivo para adicionar conteúdos (.md/.txt)
              <input type="file" accept=".md,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileParse(e.target.files[0], 'append')} />
            </label>
            {parsedAppendItems.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-sm">
                <span>{parsedAppendItems.length} conteúdos prontos para adicionar.</span>
                <button onClick={appendParsedItems} className="px-3 py-1.5 rounded-lg border border-cyan-500/30">Adicionar agora</button>
              </div>
            )}

            <form onSubmit={saveItem} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 border border-white/10 rounded-xl p-4 bg-black/30">
              <input type="date" value={itemForm.post_date} onChange={(e) => setItemForm((s: any) => ({ ...s, post_date: e.target.value }))} className="bg-black/40 border border-white/10 rounded-xl p-3" required />
              <input value={itemForm.day_label} onChange={(e) => setItemForm((s: any) => ({ ...s, day_label: e.target.value }))} placeholder="Dia (ex: Terça-feira)" className="bg-black/40 border border-white/10 rounded-xl p-3" required />
              <input value={itemForm.title} onChange={(e) => setItemForm((s: any) => ({ ...s, title: e.target.value }))} placeholder="Título" className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2" required />
              <input value={itemForm.format} onChange={(e) => setItemForm((s: any) => ({ ...s, format: e.target.value }))} placeholder="Formato (Reels, Carrossel...)" className="bg-black/40 border border-white/10 rounded-xl p-3" />
              <input value={itemForm.pillar} onChange={(e) => setItemForm((s: any) => ({ ...s, pillar: e.target.value }))} placeholder="Pilar" className="bg-black/40 border border-white/10 rounded-xl p-3" />
              <input value={itemForm.theme} onChange={(e) => setItemForm((s: any) => ({ ...s, theme: e.target.value }))} placeholder="Tema" className="bg-black/40 border border-white/10 rounded-xl p-3" />
              <input value={itemForm.objective} onChange={(e) => setItemForm((s: any) => ({ ...s, objective: e.target.value }))} placeholder="Objetivo" className="bg-black/40 border border-white/10 rounded-xl p-3" />
              <textarea value={itemForm.caption} onChange={(e) => setItemForm((s: any) => ({ ...s, caption: e.target.value }))} placeholder="Legenda" className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2 min-h-[80px]" />
              <textarea value={itemForm.storiesText} onChange={(e) => setItemForm((s: any) => ({ ...s, storiesText: e.target.value }))} placeholder="Stories (1 por linha)" className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2 min-h-[100px]" />
              <button className="md:col-span-2 px-4 py-3 bg-accent-cyan/20 border border-accent-cyan/30 rounded-xl">{editingItemId ? 'Salvar edição' : 'Adicionar conteúdo'}</button>
            </form>

            <div className="space-y-3">
              {calendarItems.map((it) => (
                <div key={it.id} className="border border-white/10 rounded-xl p-3 bg-black/30">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-semibold">{it.post_date} • {it.title}</p>
                      <p className="text-xs text-white/60">{it.format} · {it.day_label}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editItem(it)} className="px-2 py-1 rounded border border-white/20 text-xs">Editar</button>
                      <button onClick={() => removeItem(it.id)} className="px-2 py-1 rounded border border-red-500/30 text-red-300 text-xs">Excluir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setDeleteModal({ open: false, id: '', title: '' })} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#0B0B0B] p-5">
            <h3 className="text-lg font-bold mb-2">Excluir calendário</h3>
            <p className="text-sm text-white/70 mb-4">Tem certeza que deseja excluir <strong>{deleteModal.title}</strong>? Essa ação remove calendário e conteúdos.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal({ open: false, id: '', title: '' })} className="px-4 py-2 rounded-lg border border-white/20">Cancelar</button>
              <button onClick={removeCalendar} className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
