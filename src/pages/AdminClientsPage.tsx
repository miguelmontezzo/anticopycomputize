import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Users, Plus, Loader2, Search, Edit2, Trash2, X } from 'lucide-react';
import { Client } from '../types';

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', document: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setClients(data);
        }
        setLoading(false);
    };

    const handleOpenModal = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                email: client.email || '',
                phone: client.phone || '',
                document: client.document || ''
            });
        } else {
            setEditingClient(null);
            setFormData({ name: '', email: '', phone: '', document: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setFormData({ name: '', email: '', phone: '', document: '' });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            document: formData.document || null,
            updated_at: new Date().toISOString()
        };

        let err = null;
        if (editingClient) {
            const { error } = await supabase
                .from('clients')
                .update(payload)
                .eq('id', editingClient.id);
            err = error;
        } else {
            const { error } = await supabase
                .from('clients')
                .insert([payload]);
            err = error;
        }

        setSaving(false);
        if (!err) {
            handleCloseModal();
            fetchClients();
        } else {
            alert('Erro ao salvar cliente: ' + err.message);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente ${name}? Isso excluirá também páginas e formulários associados.`)) {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (!error) {
                fetchClients();
            } else {
                alert('Erro ao excluir: ' + error.message);
            }
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.document?.includes(searchTerm)
    );

    return (
        <div className="p-6 md:p-12">
            <header className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <FadeIn>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-accent-cyan" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter">Clientes Getais</h1>
                    </div>
                    <p className="text-muted font-light">
                        Gerencie as empresas e pessoas atendidas.
                    </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-[1.02] transition-transform"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cliente
                    </button>
                </FadeIn>
            </header>

            <FadeIn delay={0.2}>
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/50 transition-colors"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.02]">
                        <Users className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">Nenhum cliente encontrado</h3>
                        <p className="text-muted font-light">
                            {searchTerm ? 'Tente buscar com outros termos.' : 'Você ainda não possui clientes cadastrados.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClients.map(client => (
                            <div key={client.id} className="bg-black/40 border border-white/10 hover:border-white/20 transition-colors p-6 rounded-2xl flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold truncate">{client.name}</h3>
                                        <div className="text-xs text-muted font-mono mt-1">ID: {client.id.split('-')[0]}...</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(client)}
                                            className="p-2 text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.id, client.name)}
                                            className="p-2 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-muted font-light flex-1">
                                    {client.email && <div><span className="font-medium text-white/50">Email:</span> <a href={`mailto:${client.email}`} className="text-white hover:text-accent-cyan">{client.email}</a></div>}
                                    {client.phone && <div><span className="font-medium text-white/50">Tel:</span> <span className="text-white">{client.phone}</span></div>}
                                    {client.document && <div><span className="font-medium text-white/50">Doc:</span> <span className="text-white">{client.document}</span></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </FadeIn>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-bg-primary border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 text-muted hover:text-white bg-white/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6">
                            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                    Nome da Empresa/Pessoa *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                    Email de Contato
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                                        CPF / CNPJ
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.document}
                                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
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
                                    className="px-6 py-3 rounded-full text-sm font-bold bg-accent-cyan text-black hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Salvando...' : 'Salvar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
