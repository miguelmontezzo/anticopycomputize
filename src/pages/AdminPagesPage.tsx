import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Layout, Plus, Loader2, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Page, Client } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { Input, Select, Textarea } from '../components/ui/Input';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<(Page & { clients?: { name: string } })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({ client_id: '', title: '', slug: '', theme_color: '#ffffff', is_published: false });
  const [contentJson, setContentJson] = useState('{}');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [pagesRes, clientsRes] = await Promise.all([
      supabase.from('pages').select('*, clients(name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('name', { ascending: true }),
    ]);
    if (pagesRes.data) setPages(pagesRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    setLoading(false);
  };

  const handleOpenModal = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({ client_id: page.client_id, title: page.title, slug: page.slug, theme_color: page.theme_color || '#ffffff', is_published: page.is_published });
      setContentJson(JSON.stringify(page.content, null, 2));
    } else {
      setEditingPage(null);
      setFormData({ client_id: clients[0]?.id || '', title: '', slug: '', theme_color: '#ffffff', is_published: false });
      setContentJson('{\n  "blocks": []\n}');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingPage(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let parsedContent = {};
    try { parsedContent = JSON.parse(contentJson); } catch {
      alert('JSON inválido. Verifique a formatação.');
      setSaving(false);
      return;
    }
    const payload = { client_id: formData.client_id, title: formData.title, slug: formData.slug, theme_color: formData.theme_color, is_published: formData.is_published, content: parsedContent, updated_at: new Date().toISOString() };
    if (editingPage) {
      const { error } = await supabase.from('pages').update(payload).eq('id', editingPage.id);
      if (!error) { handleCloseModal(); fetchData(); } else alert('Erro: ' + error.message);
    } else {
      const { error } = await supabase.from('pages').insert([payload]);
      if (!error) { handleCloseModal(); fetchData(); } else alert('Erro: ' + error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Excluir a página '${title}'?`)) {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (!error) fetchData(); else alert('Erro: ' + error.message);
    }
  };

  const togglePublish = async (page: Page) => {
    const { error } = await supabase.from('pages').update({ is_published: !page.is_published }).eq('id', page.id);
    if (!error) fetchData();
  };

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        title="Páginas Dinâmicas"
        subtitle="Crie landing pages para os seus clientes"
        icon={<Layout className="w-4 h-4" />}
        action={
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal()}
            disabled={clients.length === 0}
          >
            Nova Página
          </Button>
        }
      />

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar página ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filteredPages.length === 0 ? (
        <EmptyState
          icon={<Layout className="w-5 h-5" />}
          title="Nenhuma página encontrada"
          description={searchTerm ? 'Tente buscar com outros termos.' : 'Crie a primeira página.'}
          action={!searchTerm && clients.length > 0 ? <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>Nova Página</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPages.map(page => (
            <Card key={page.id} className="flex flex-col gap-3 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: page.theme_color || '#999' }} />
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{page.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenModal(page)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(page.id, page.title)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">{page.clients?.name || '—'}</div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => togglePublish(page)}
                  className="transition-colors"
                >
                  <Badge variant={page.is_published ? 'approved' : 'default'}>
                    {page.is_published ? 'Publicada' : 'Rascunho'}
                  </Badge>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">/{page.slug}</span>
                  {page.is_published && (
                    <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={handleCloseModal} title={editingPage ? 'Editar Página' : 'Nova Página'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Cliente *"
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            >
              <option value="" disabled>Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                Publicar imediatamente
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Título *"
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                const t = e.target.value;
                const s = !editingPage ? t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : formData.slug;
                setFormData({ ...formData, title: t, slug: s });
              }}
            />
            <Input
              label="Slug *"
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide shrink-0">Cor tema</label>
            <input
              type="color"
              value={formData.theme_color}
              onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200 p-0.5"
            />
            <Input
              type="text"
              value={formData.theme_color}
              onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
              className="font-mono text-sm flex-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
              Conteúdo JSON (avançado)
            </label>
            <textarea
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              rows={6}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar Página</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
