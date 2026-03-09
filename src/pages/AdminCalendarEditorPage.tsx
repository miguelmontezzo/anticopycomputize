import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Plus, Loader2, Trash2, Save, ChevronRight
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import Modal from '../components/ui/Modal';

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

type Calendar = {
  id: string;
  slug: string;
  title: string;
  week_start: string;
  week_end: string;
  status: string;
  client_id: string;
};

const FORMATS = ['Reels', 'Carrossel', 'Post Estático', 'Stories', 'Outro'];

const emptyItem = {
  post_date: '',
  day_label: '',
  title: '',
  format: 'Reels',
  pillar: '',
  theme: '',
  objective: '',
  caption: '',
  storiesText: '',
};

const statusBadge = (item: CalendarItem) => {
  const status = (item as any).post_status;
  if (status === 'aprovado') return 'approved' as const;
  if (status === 'reprovado') return 'rejected' as const;
  return 'pending' as const;
};

const statusLabel = (item: CalendarItem) => {
  const status = (item as any).post_status;
  if (status === 'aprovado') return 'aprovado';
  if (status === 'reprovado') return 'reprovado';
  return 'pendente';
};

export default function AdminCalendarEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyItem>(emptyItem);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    if (!supabase) { setLoading(false); return; }
    const [calRes, itemsRes] = await Promise.all([
      supabase.from('content_calendars').select('*').eq('id', id).single(),
      supabase.from('content_calendar_items').select('*').eq('calendar_id', id).order('post_date', { ascending: true }),
    ]);
    if (calRes.data) setCalendar(calRes.data);
    if (itemsRes.data) setItems(itemsRes.data as CalendarItem[]);
    setLoading(false);
  };

  const selectItem = (item: CalendarItem) => {
    setSelectedId(item.id);
    setIsNew(false);
    setForm({
      post_date: item.post_date,
      day_label: item.day_label,
      title: item.title,
      format: item.format || 'Reels',
      pillar: item.pillar || '',
      theme: item.theme || '',
      objective: item.objective || '',
      caption: item.caption || '',
      storiesText: (item.stories || []).join('\n'),
    });
  };

  const startNew = () => {
    setSelectedId(null);
    setIsNew(true);
    setForm(emptyItem);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!id || !form.post_date || !form.title) return;
    setSaving(true);

    const payload = {
      calendar_id: id,
      post_date: form.post_date,
      day_label: form.day_label || form.post_date,
      title: form.title,
      format: form.format,
      pillar: form.pillar,
      theme: form.theme,
      objective: form.objective,
      caption: form.caption,
      stories: form.storiesText.split('\n').map(s => s.trim()).filter(Boolean),
    };

    if (selectedId && !isNew) {
      const { error } = await supabase.from('content_calendar_items').update(payload).eq('id', selectedId);
      if (error) alert(error.message);
    } else {
      const { data, error } = await supabase.from('content_calendar_items').insert([payload]).select().single();
      if (error) {
        alert(error.message);
      } else if (data) {
        setSelectedId(data.id);
        setIsNew(false);
      }
    }

    setSaving(false);
    await loadData();
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    await supabase.from('content_calendar_items').delete().eq('id', selectedId);
    setDeleting(false);
    setDeleteConfirm(false);
    setSelectedId(null);
    setIsNew(false);
    setForm(emptyItem);
    await loadData();
  };

  const selectedItem = items.find(i => i.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="p-10 text-center text-gray-500">
        Calendário não encontrado.{' '}
        <Link to="/admin/calendarios" className="text-black underline">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link
          to="/admin/calendarios"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Calendários
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className="text-sm font-medium text-gray-900">{calendar.title}</span>
        <span className="text-sm text-gray-400 font-mono">/{calendar.slug}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{calendar.week_start} → {calendar.week_end}</span>
          <a
            href={`/admin/calendario/${calendar.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded px-2 py-1"
          >
            Board view
          </a>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Post list */}
        <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {items.length} posts
            </span>
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1 text-xs font-medium text-black hover:text-gray-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo post
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isNew && (
              <div className="px-3 py-3 border-b border-blue-50 bg-blue-50">
                <div className="text-xs font-medium text-blue-700">Novo post</div>
                <div className="text-xs text-blue-500 mt-0.5">Preencha o formulário ao lado</div>
              </div>
            )}
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => selectItem(item)}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedId === item.id && !isNew ? 'bg-gray-100' : ''
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900 truncate">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.post_date} · {item.format}</div>
                  </div>
                  <Badge variant={statusBadge(item)} className="shrink-0 mt-0.5">
                    {statusLabel(item)}
                  </Badge>
                </div>
              </button>
            ))}

            {items.length === 0 && !isNew && (
              <div className="text-center py-12 text-gray-400 text-sm px-4">
                Nenhum post. Clique em "Novo post" para começar.
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {!selectedId && !isNew ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Selecione um post para editar ou clique em "Novo post"
            </div>
          ) : (
            <form onSubmit={handleSave} className="max-w-2xl mx-auto p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-gray-900">
                  {isNew ? 'Novo post' : 'Editar post'}
                </h2>
                <div className="flex items-center gap-2">
                  {selectedId && !isNew && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setDeleteConfirm(true)}
                    >
                      Excluir
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    loading={saving}
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Data *"
                  type="date"
                  required
                  value={form.post_date}
                  onChange={(e) => setForm(s => ({ ...s, post_date: e.target.value }))}
                />
                <Input
                  label="Dia / Label"
                  type="text"
                  placeholder="ex: Segunda-feira"
                  value={form.day_label}
                  onChange={(e) => setForm(s => ({ ...s, day_label: e.target.value }))}
                />
              </div>

              <Input
                label="Título *"
                type="text"
                required
                placeholder="Título do post"
                value={form.title}
                onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Formato"
                  value={form.format}
                  onChange={(e) => setForm(s => ({ ...s, format: e.target.value }))}
                >
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
                <Input
                  label="Pilar"
                  type="text"
                  placeholder="ex: Autoridade"
                  value={form.pillar}
                  onChange={(e) => setForm(s => ({ ...s, pillar: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tema"
                  type="text"
                  placeholder="ex: Proteção de dados"
                  value={form.theme}
                  onChange={(e) => setForm(s => ({ ...s, theme: e.target.value }))}
                />
                <Input
                  label="Objetivo"
                  type="text"
                  placeholder="ex: Gerar awareness"
                  value={form.objective}
                  onChange={(e) => setForm(s => ({ ...s, objective: e.target.value }))}
                />
              </div>

              <Textarea
                label="Legenda (Caption)"
                placeholder="Texto completo da legenda..."
                rows={6}
                value={form.caption}
                onChange={(e) => setForm(s => ({ ...s, caption: e.target.value }))}
              />

              <Textarea
                label="Stories (1 por linha)"
                placeholder="Story 1&#10;Story 2&#10;Story 3"
                rows={4}
                value={form.storiesText}
                onChange={(e) => setForm(s => ({ ...s, storiesText: e.target.value }))}
              />

              <div className="pt-2 flex justify-end">
                <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
                  {saving ? 'Salvando...' : 'Salvar post'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      <Modal
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Excluir post"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
