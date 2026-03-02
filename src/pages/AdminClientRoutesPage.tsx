import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ExternalLink, Copy, Check, Layers, Edit2, Trash2, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { Input, Textarea } from '../components/ui/Input';

type ClientProject = {
  id: string;
  nome: string;
  slug: string;
  oferta: string;
  analise_resumo: string;
  status: string;
  created_at: string;
};

const emptyForm = { nome: '', slug: '', oferta: '', analise_resumo: '' };

export default function AdminClientRoutesPage() {
  const [items, setItems] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState<ClientProject | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ClientProject | null>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  async function load() {
    if (!supabase) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('client_projects').select('*').order('created_at', { ascending: false });
    setItems((data as ClientProject[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.nome || !createForm.slug) return;
    if (!supabase) return alert('Supabase não configurado.');
    setSaving(true);
    const { error } = await supabase.from('client_projects').insert([{
      nome: createForm.nome,
      slug: createForm.slug.toLowerCase().trim(),
      oferta: createForm.oferta,
      analise_resumo: createForm.analise_resumo,
      status: 'ativo',
    }]);
    setSaving(false);
    if (error) return alert(`Erro: ${error.message}`);
    setCreateForm(emptyForm);
    setCreateOpen(false);
    load();
  };

  const openEdit = (item: ClientProject) => {
    setEditingItem(item);
    setEditForm({ nome: item.nome, slug: item.slug, oferta: item.oferta, analise_resumo: item.analise_resumo });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !supabase) return;
    setEditSaving(true);
    const { error } = await supabase.from('client_projects').update({
      nome: editForm.nome,
      slug: editForm.slug.toLowerCase().trim(),
      oferta: editForm.oferta,
      analise_resumo: editForm.analise_resumo,
    }).eq('id', editingItem.id);
    setEditSaving(false);
    if (error) return alert(`Erro: ${error.message}`);
    setEditingItem(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget || !supabase) return;
    setDeleteConfirming(true);
    const { error } = await supabase.from('client_projects').delete().eq('id', deleteTarget.id);
    setDeleteConfirming(false);
    if (error) return alert(`Erro: ${error.message}`);
    setDeleteTarget(null);
    load();
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const links = (item: ClientProject) => [
    { label: 'Apresentação', url: `${window.location.origin}/${item.slug}/ia-service` },
    { label: 'Análise', url: `${window.location.origin}/${item.slug}/analise` },
    { label: 'Form EMP', url: `${window.location.origin}/${item.slug}/emp` },
    { label: 'Cal. público', url: `${window.location.origin}/calendario/${item.slug}` },
    { label: 'Cal. admin', url: `${window.location.origin}/admin/calendario/${item.slug}` },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <PageHeader
        title="Projetos & Rotas"
        subtitle="Crie apresentações, análises e formulário EMP por cliente via slug"
        icon={<Layers className="w-4 h-4" />}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            Novo Projeto
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-5 h-5" />}
          title="Nenhum projeto cadastrado"
          description="Crie um projeto para gerar os links do cliente."
          action={<Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>Novo Projeto</Button>}
        />
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{item.nome}</h3>
                    <span className="text-xs text-gray-400 font-mono">/{item.slug}</span>
                    <Badge variant={item.status === 'ativo' ? 'active' : 'inactive'}>{item.status}</Badge>
                  </div>
                  {item.oferta && <p className="text-xs text-gray-500 mt-1">{item.oferta}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {links(item).map(row => (
                  <div key={row.url} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5">
                    <span className="text-xs text-gray-600 truncate mr-1">{row.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => copy(row.url, row.url)} className="text-gray-400 hover:text-gray-700">
                        {copied === row.url ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a href={row.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Projeto" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome do cliente *"
              required
              value={createForm.nome}
              onChange={e => setCreateForm(s => ({ ...s, nome: e.target.value }))}
            />
            <Input
              label="Slug *"
              required
              placeholder="ex: computize"
              value={createForm.slug}
              onChange={e => setCreateForm(s => ({ ...s, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
            />
          </div>
          <Input
            label="Oferta principal"
            value={createForm.oferta}
            onChange={e => setCreateForm(s => ({ ...s, oferta: e.target.value }))}
          />
          <Textarea
            label="Resumo da análise"
            placeholder="E + Mas + Por Isso..."
            rows={4}
            value={createForm.analise_resumo}
            onChange={e => setCreateForm(s => ({ ...s, analise_resumo: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Criar projeto</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingItem} onClose={() => setEditingItem(null)} title="Editar Projeto" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome *"
              required
              value={editForm.nome}
              onChange={e => setEditForm(s => ({ ...s, nome: e.target.value }))}
            />
            <Input
              label="Slug *"
              required
              value={editForm.slug}
              onChange={e => setEditForm(s => ({ ...s, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
            />
          </div>
          <Input
            label="Oferta"
            value={editForm.oferta}
            onChange={e => setEditForm(s => ({ ...s, oferta: e.target.value }))}
          />
          <Textarea
            label="Resumo da análise"
            rows={4}
            value={editForm.analise_resumo}
            onChange={e => setEditForm(s => ({ ...s, analise_resumo: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>Cancelar</Button>
            <Button type="submit" loading={editSaving}>Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Excluir projeto" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Excluir <strong className="text-gray-900">{deleteTarget?.nome}</strong>? Todos os links deixarão de funcionar.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleteConfirming} onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
