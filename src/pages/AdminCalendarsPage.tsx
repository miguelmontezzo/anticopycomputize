import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CalendarDays, Plus, Loader2, Trash2, Copy, Check, Edit2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { Input, Select } from '../components/ui/Input';

type Client = { id: string; name: string };
type Calendar = {
  id: string;
  slug: string;
  title: string;
  week_start: string;
  week_end: string;
  status: string;
  client_id: string;
};

const emptyForm = { client_id: '', slug: '', title: '', week_start: '', week_end: '' };

export default function AdminCalendarsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Calendar | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    if (!supabase) { setLoading(false); return; }
    const [cRes, calRes] = await Promise.all([
      supabase.from('clients').select('id,name').order('name', { ascending: true }),
      supabase.from('content_calendars').select('*').order('created_at', { ascending: false }),
    ]);
    if (cRes.data) setClients(cRes.data as Client[]);
    if (calRes.data) setCalendars(calRes.data as Calendar[]);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.slug || !form.title || !form.week_start || !form.week_end) return;
    setSaving(true);
    const { error } = await supabase.from('content_calendars').insert([{ ...form, status: 'active' }]);
    setSaving(false);
    if (error) return alert(error.message);
    setForm(emptyForm);
    setCreateOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from('content_calendars').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const clientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || '—';

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <PageHeader
        title="Calendários de Conteúdo"
        subtitle="Gerencie os calendários de posts por cliente"
        icon={<CalendarDays className="w-4 h-4" />}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            Novo Calendário
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : calendars.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-5 h-5" />}
          title="Nenhum calendário"
          description="Crie o primeiro calendário de conteúdo."
          action={<Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>Novo Calendário</Button>}
        />
      ) : (
        <div className="space-y-3">
          {calendars.map(cal => {
            const pubUrl = `${window.location.origin}/calendario/${cal.slug}`;
            const admUrl = `${window.location.origin}/admin/calendario/${cal.slug}`;
            return (
              <Card key={cal.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{cal.title}</h3>
                      <span className="text-xs text-gray-400 font-mono">/{cal.slug}</span>
                      <Badge variant={cal.status === 'active' ? 'active' : 'default'}>{cal.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {clientName(cal.client_id)} · {cal.week_start} → {cal.week_end}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/admin/calendarios/${cal.id}`}>
                      <Button variant="secondary" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />}>
                        Gerenciar posts
                      </Button>
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(cal)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { label: 'Link público', url: pubUrl },
                    { label: 'Link admin (board)', url: admUrl },
                  ].map(row => (
                    <div key={row.url} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copy(row.url)} className="text-gray-400 hover:text-gray-700">
                          {copied === row.url
                            ? <Check className="w-3.5 h-3.5 text-green-500" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>
                        <a href={row.url} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-black">
                          Abrir
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Calendário" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Cliente *"
            required
            value={form.client_id}
            onChange={(e) => setForm(s => ({ ...s, client_id: e.target.value }))}
          >
            <option value="">Selecione um cliente...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Slug *"
              type="text"
              required
              placeholder="ex: computize-mar26"
              value={form.slug}
              onChange={(e) => setForm(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            />
            <div />
          </div>
          <Input
            label="Título *"
            type="text"
            required
            placeholder="Calendário Março 2026"
            value={form.title}
            onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Início *"
              type="date"
              required
              value={form.week_start}
              onChange={(e) => setForm(s => ({ ...s, week_start: e.target.value }))}
            />
            <Input
              label="Fim *"
              type="date"
              required
              value={form.week_end}
              onChange={(e) => setForm(s => ({ ...s, week_end: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Criar calendário</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Excluir calendário" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja excluir <strong className="text-gray-900">{deleteTarget?.title}</strong>? Todos os posts serão removidos.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
