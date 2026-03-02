import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CalendarDays, Plus, Copy, Check } from 'lucide-react';

type Client = { id: string; name: string };
type Calendar = { id: string; slug: string; title: string; week_start: string; week_end: string; status: string; client_id: string };

export default function AdminCalendarsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Calendar[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ client_id: '', slug: '', title: '', week_start: '', week_end: '' });

  const load = async () => {
    const [cRes, iRes] = await Promise.all([
      supabase.from('clients').select('id,name').order('name', { ascending: true }),
      supabase.from('content_calendars').select('*').order('created_at', { ascending: false }),
    ]);
    if (cRes.data) setClients(cRes.data as Client[]);
    if (iRes.data) setItems(iRes.data as Calendar[]);
  };

  useEffect(() => { load(); }, []);

  const createCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.slug || !form.title || !form.week_start || !form.week_end) return;
    const { error } = await supabase.from('content_calendars').insert([{ ...form, status: 'active' }]);
    if (error) return alert(error.message);
    setForm({ client_id: '', slug: '', title: '', week_start: '', week_end: '' });
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
        <p className="text-muted">Crie e gerencie calendários públicos por cliente.</p>
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
                <a href={adm} className="px-3 py-2 rounded-lg border border-white/20 text-sm">Abrir no admin</a>
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
    </div>
  );
}
