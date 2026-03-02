import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Layout, Plus, Loader2, Search, Edit2, Trash2, X, ExternalLink, Globe } from 'lucide-react';
import { Page, Client } from '../types';

export default function AdminPagesPage() {
    const [pages, setPages] = useState<(Page & { clients?: { name: string } })[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState({ client_id: '', title: '', slug: '', theme_color: '#ffffff', is_published: false });
    const [contentJson, setContentJson] = useState('{}');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [pagesRes, clientsRes] = await Promise.all([
            supabase.from('pages').select('*, clients(name)').order('created_at', { ascending: false }),
            supabase.from('clients').select('*').order('name', { ascending: true })
        ]);

        if (pagesRes.data) setPages(pagesRes.data);
        if (clientsRes.data) setClients(clientsRes.data);

        setLoading(false);
    };

    const handleOpenModal = (page?: Page) => {
        if (page) {
            setEditingPage(page);
            setFormData({
                client_id: page.client_id,
                title: page.title,
                slug: page.slug,
                theme_color: page.theme_color || '#ffffff',
                is_published: page.is_published
            });
            setContentJson(JSON.stringify(page.content, null, 2));
        } else {
            setEditingPage(null);
            setFormData({ client_id: clients[0]?.id || '', title: '', slug: '', theme_color: '#ffffff', is_published: false });
            setContentJson('{\n  "blocks": []\n}');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let parsedContent = {};
        try {
            parsedContent = JSON.parse(contentJson);
        } catch (err) {
            alert('JSON de Conteúdo inválido. Verifique a formatação.');
            setSaving(false);
            return;
        }

        const payload = {
            client_id: formData.client_id,
            title: formData.title,
            slug: formData.slug,
            theme_color: formData.theme_color,
            is_published: formData.is_published,
            content: parsedContent,
            updated_at: new Date().toISOString()
        };

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
        if (window.confirm(`Tem certeza que deseja excluir a página '${title}'?`)) {
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
        <div className="p-6 md:p-12">
            <header className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <FadeIn>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                            <Layout className="w-5 h-5 text-accent-purple" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter">Páginas Dinâmicas</h1>
                    </div>
                    <p className="text-muted font-light">
                        Crie e gerencie landing pages para os seus clientes.
                    </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={clients.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        title={clients.length === 0 ? "Cadastre um cliente primeiro" : ""}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Página
                    </button>
                </FadeIn>
            </header>

            <FadeIn delay={0.2}>
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar página ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-purple/50 transition-colors"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
                    </div>
                ) : filteredPages.length === 0 ? (
                    <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.02]">
                        <Layout className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">Nenhuma página encontrada</h3>
                        <p className="text-muted font-light">
                            {searchTerm ? 'Tente buscar com outros termos.' : 'Crie a primeira página para um cliente.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPages.map(page => (
                            <div key={page.id} className="bg-black/40 border border-white/10 hover:border-white/20 transition-colors p-6 rounded-2xl flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: page.theme_color }}></div>
                                            <h3 className="text-lg font-bold truncate">{page.title}</h3>
                                        </div>
                                        <div className="text-xs text-accent-purple/80 font-medium">
                                            {page.clients?.name || 'Cliente Desconhecido'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(page)}
                                            className="p-2 text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(page.id, page.title)}
                                            className="p-2 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm text-muted font-light flex-1">
                                    <div className="flex items-center justify-between">
                                        <span>Status:</span>
                                        <button
                                            onClick={() => togglePublish(page)}
                                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${page.is_published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}
                                        >
                                            {page.is_published ? 'Publicada' : 'Rascunho'}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Link:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/70 max-w-[150px] truncate">/{page.slug}</span>
                                            {page.is_published && (
                                                <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:text-white transition-colors" title="Abrir página publicamente">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </FadeIn>

            {/* Modal de Criação / Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-bg-primary border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 text-muted hover:text-white bg-white/5 rounded-full transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-accent-purple" />
                            {editingPage ? 'Editar Página' : 'Nova Página'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                        Cliente *
                                    </label>
                                    <select
                                        required
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors appearance-none"
                                    >
                                        <option value="" disabled>Selecione um cliente...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2 justify-center pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                            className="w-5 h-5 rounded border-white/20 bg-black/50 text-accent-purple focus:ring-accent-purple focus:ring-offset-black"
                                        />
                                        <span className="text-sm font-medium">Publicar Página Imediatamente</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                        Título da Página *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            const newSlug = !editingPage ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : formData.slug;
                                            setFormData({ ...formData, title: newTitle, slug: newSlug });
                                        }}
                                        placeholder="Ex: Consultoria Tech"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                        URL Slug *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="ex: consultoria-tech"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                    Cor Tema Primária (Brand)
                                </label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        value={formData.theme_color}
                                        onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                                        className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent p-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.theme_color}
                                        onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors font-mono text-sm uppercase"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2 flex justify-between">
                                    Conteúdo da Página (JSON)
                                    <span className="text-white/30 lowercase font-normal">Avançado</span>
                                </label>
                                <textarea
                                    value={contentJson}
                                    onChange={(e) => setContentJson(e.target.value)}
                                    rows={8}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors font-mono text-xs whitespace-pre"
                                ></textarea>
                                <p className="text-xs text-muted mt-2">Use este campo para definir os blocos dinâmicos da página baseados no `theme_color`.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 rounded-full text-sm font-bold bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 rounded-full text-sm font-bold bg-accent-purple text-white hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Salvando...' : 'Salvar Página'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
