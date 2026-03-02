import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { ClipboardList, Plus, Loader2, Search, Edit2, Trash2, X, Settings2 } from 'lucide-react';
import { Form, Client, Page } from '../types';
import { useNavigate } from 'react-router-dom';

export default function AdminFormsPage() {
    const [forms, setForms] = useState<(Form & { clients?: { name: string }, pages?: { title: string } })[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingForm, setEditingForm] = useState<Form | null>(null);
    const [formData, setFormData] = useState({ client_id: '', page_id: '', title: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [formsRes, clientsRes, pagesRes] = await Promise.all([
            supabase.from('forms').select('*, clients(name), pages(title)').order('created_at', { ascending: false }),
            supabase.from('clients').select('*').order('name', { ascending: true }),
            supabase.from('pages').select('*').order('title', { ascending: true })
        ]);

        if (formsRes.data) setForms(formsRes.data);
        if (clientsRes.data) setClients(clientsRes.data);
        if (pagesRes.data) setPages(pagesRes.data);

        setLoading(false);
    };

    const handleOpenModal = (form?: Form) => {
        if (form) {
            setEditingForm(form);
            setFormData({
                client_id: form.client_id,
                page_id: form.page_id || '',
                title: form.title,
                description: form.description || ''
            });
        } else {
            setEditingForm(null);
            setFormData({ client_id: clients[0]?.id || '', page_id: '', title: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingForm(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            client_id: formData.client_id,
            page_id: formData.page_id || null, // convert empty string to null
            title: formData.title,
            description: formData.description
        };

        if (editingForm) {
            const { error } = await supabase.from('forms').update(payload).eq('id', editingForm.id);
            if (!error) { handleCloseModal(); fetchData(); } else alert('Erro: ' + error.message);
        } else {
            const { data, error } = await supabase.from('forms').insert([payload]).select().single();
            if (!error && data) {
                handleCloseModal();
                fetchData();
                navigate(`/admin/forms/${data.id}`); // redirect to builder
            } else alert('Erro: ' + error?.message);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o formulário '${title}'? Isso excluirá todos os campos e respostas.`)) {
            const { error } = await supabase.from('forms').delete().eq('id', id);
            if (!error) fetchData(); else alert('Erro: ' + error.message);
        }
    };

    const filteredForms = forms.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-12">
            <header className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <FadeIn>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-orange-400" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter">Formulários e Leads</h1>
                    </div>
                    <p className="text-muted font-light">
                        Crie formulários para captação de dados associados aos clientes.
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
                        Novo Formulário
                    </button>
                </FadeIn>
            </header>

            <FadeIn delay={0.2}>
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar formulário ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder:text-muted focus:outline-none focus:border-orange-400/50 transition-colors"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                    </div>
                ) : filteredForms.length === 0 ? (
                    <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.02]">
                        <ClipboardList className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">Nenhum formulário encontrado</h3>
                        <p className="text-muted font-light">
                            {searchTerm ? 'Tente buscar com outros termos.' : 'Crie seu primeiro formulário.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredForms.map(form => (
                            <div key={form.id} className="bg-black/40 border border-white/10 hover:border-white/20 transition-colors p-6 rounded-2xl flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold truncate pr-2">{form.title}</h3>
                                        <div className="text-xs text-orange-400 font-medium">
                                            {form.clients?.name || 'Cliente Desconhecido'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => navigate(`/admin/forms/${form.id}`)}
                                            className="p-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                                            title="Editar Campos"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                            Campos
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(form)}
                                            className="p-2 text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Editar Configurações"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(form.id, form.title)}
                                            className="p-2 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm text-muted font-light flex-1">
                                    {form.description && <p className="text-white/70 line-clamp-2">{form.description}</p>}
                                    {form.pages && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/50">Página:</span>
                                            <span className="text-white bg-white/10 px-2 py-0.5 rounded text-xs">{form.pages.title}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => navigate(`/admin/forms/${form.id}/responses`)}
                                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors text-center"
                                    >
                                        Ver Respostas (Leads)
                                    </button>
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
                    <div className="relative bg-bg-primary border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 text-muted hover:text-white bg-white/5 rounded-full transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-orange-400" />
                            {editingForm ? 'Opções do Formulário' : 'Novo Formulário'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                    Título do Formulário *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Contato - Landing Page X"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                    Descrição Breve
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Instruções ou subtítulo do formulário..."
                                    rows={3}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                        Cliente Responsável *
                                    </label>
                                    <select
                                        required
                                        value={formData.client_id}
                                        onChange={(e) => {
                                            setFormData({ ...formData, client_id: e.target.value, page_id: '' }); // reset page when client changes
                                        }}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors appearance-none"
                                    >
                                        <option value="" disabled>Selecione um cliente...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                        Vincular à Página (Opcional)
                                    </label>
                                    <select
                                        value={formData.page_id}
                                        onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                                        disabled={!formData.client_id}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors appearance-none disabled:opacity-50"
                                    >
                                        <option value="">Nenhuma página específica</option>
                                        {pages.filter(p => p.client_id === formData.client_id).map(p => (
                                            <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>
                                        ))}
                                    </select>
                                </div>
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
                                    className="px-6 py-3 rounded-full text-sm font-bold bg-orange-500 text-white hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Salvando...' : (editingForm ? 'Salvar Configurações' : 'Criar e Adicionar Campos')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
