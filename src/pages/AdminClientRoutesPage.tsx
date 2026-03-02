import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ExternalLink, Copy, Check, FolderKanban, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { FadeIn } from '../components/Shared';

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

    // Create form
    const [createForm, setCreateForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Edit modal
    const [editingItem, setEditingItem] = useState<ClientProject | null>(null);
    const [editForm, setEditForm] = useState(emptyForm);
    const [editSaving, setEditSaving] = useState(false);

    // Delete modal
    const [deleteTarget, setDeleteTarget] = useState<ClientProject | null>(null);
    const [deleteConfirming, setDeleteConfirming] = useState(false);

    async function load() {
        if (!supabase) { setItems([]); setLoading(false); return; }
        setLoading(true);
        const { data } = await supabase
            .from('client_projects')
            .select('*')
            .order('created_at', { ascending: false });
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
        if (error) return alert(`Erro ao criar cliente: ${error.message}`);
        setCreateForm(emptyForm);
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
        if (error) return alert(`Erro ao salvar: ${error.message}`);
        setEditingItem(null);
        load();
    };

    const handleDelete = async () => {
        if (!deleteTarget || !supabase) return;
        setDeleteConfirming(true);
        const { error } = await supabase.from('client_projects').delete().eq('id', deleteTarget.id);
        setDeleteConfirming(false);
        if (error) return alert(`Erro ao excluir: ${error.message}`);
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
        { label: 'Calendário público', url: `${window.location.origin}/calendario/${item.slug}` },
        { label: 'Calendário admin', url: `${window.location.origin}/admin/calendario/${item.slug}` },
    ];

    return (
        <div className="p-6 md:p-12 text-white">
            <header className="mb-8 border-b border-white/10 pb-5">
                <FadeIn>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-accent-cyan" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter">Clientes & Rotas</h1>
                    </div>
                    <p className="text-muted">Crie apresentações, análises e formulário EMP por cliente via slug.</p>
                </FadeIn>
            </header>

            {/* Create form */}
            <FadeIn delay={0.1}>
                <form onSubmit={handleCreate} className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        className="bg-black/40 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-accent-cyan/50"
                        placeholder="Nome do cliente"
                        value={createForm.nome}
                        onChange={e => setCreateForm(s => ({ ...s, nome: e.target.value }))}
                        required
                    />
                    <input
                        className="bg-black/40 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-accent-cyan/50"
                        placeholder="Slug (ex: computize)"
                        value={createForm.slug}
                        onChange={e => setCreateForm(s => ({ ...s, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                        required
                    />
                    <input
                        className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2 focus:outline-none focus:border-accent-cyan/50"
                        placeholder="Oferta principal"
                        value={createForm.oferta}
                        onChange={e => setCreateForm(s => ({ ...s, oferta: e.target.value }))}
                    />
                    <textarea
                        className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2 min-h-[110px] focus:outline-none focus:border-accent-cyan/50"
                        placeholder="Resumo da análise (E + Mas + Por Isso)"
                        value={createForm.analise_resumo}
                        onChange={e => setCreateForm(s => ({ ...s, analise_resumo: e.target.value }))}
                    />
                    <button
                        disabled={saving}
                        className="md:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan/20 border border-accent-cyan/30 rounded-xl hover:bg-accent-cyan/30 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {saving ? 'Salvando...' : 'Criar cliente e rotas'}
                    </button>
                </form>
            </FadeIn>

            {/* List */}
            <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="text-muted flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.02] text-muted">
                            Nenhum cliente cadastrado ainda.
                        </div>
                    ) : items.map(item => (
                        <div key={item.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                                <div>
                                    <h3 className="font-bold text-lg">{item.nome} <span className="text-xs text-muted">/{item.slug}</span></h3>
                                    <p className="text-sm text-muted">{item.oferta || 'Sem oferta definida'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">{item.status}</span>
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="p-2 text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(item)}
                                        className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                                {links(item).map(row => (
                                    <div key={row.url} className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between gap-2">
                                        <span className="truncate text-white/70">{row.label}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => copy(row.url, row.url)} className="hover:text-accent-cyan transition-colors">
                                                {copied === row.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                            <a href={row.url} target="_blank" rel="noreferrer" className="hover:text-accent-cyan transition-colors">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </FadeIn>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
                    <div className="relative bg-bg-primary border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 p-2 text-muted hover:text-white bg-white/5 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-accent-cyan" />
                            Editar Cliente
                        </h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">Nome *</label>
                                <input
                                    required
                                    value={editForm.nome}
                                    onChange={e => setEditForm(s => ({ ...s, nome: e.target.value }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">Slug *</label>
                                <input
                                    required
                                    value={editForm.slug}
                                    onChange={e => setEditForm(s => ({ ...s, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">Oferta</label>
                                <input
                                    value={editForm.oferta}
                                    onChange={e => setEditForm(s => ({ ...s, oferta: e.target.value }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">Resumo da análise</label>
                                <textarea
                                    rows={4}
                                    value={editForm.analise_resumo}
                                    onChange={e => setEditForm(s => ({ ...s, analise_resumo: e.target.value }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors resize-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                                <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-3 rounded-full text-sm font-bold bg-white/5 hover:bg-white/10 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={editSaving} className="px-6 py-3 rounded-full text-sm font-bold bg-accent-cyan text-black hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center gap-2">
                                    {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editSaving ? 'Salvando...' : 'Salvar alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-bg-primary border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-2">Excluir cliente</h2>
                        <p className="text-muted text-sm mb-6">
                            Tem certeza que deseja excluir <strong className="text-white">{deleteTarget.nome}</strong>? Todos os links gerados deixarão de funcionar.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl border border-white/20 text-sm font-bold hover:bg-white/5 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} disabled={deleteConfirming} className="px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-bold hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50">
                                {deleteConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
                                {deleteConfirming ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
