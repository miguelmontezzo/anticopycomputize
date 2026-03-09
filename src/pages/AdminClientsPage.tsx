import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Plus, Loader2, Search, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Client } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { Input, Select } from '../components/ui/Input';

type ClientExtended = Client & {
  slug?: string;
  oferta?: string;
  plan_type?: string;
};

const PLAN_TYPES = ['starter', 'growth', 'premium', 'enterprise'];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientExtended | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', document: '', slug: '', oferta: '', plan_type: 'starter'
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientExtended | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    if (!supabase) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setClients(data);
    setLoading(false);
  };

  const handleOpenModal = (client?: ClientExtended) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        document: client.document || '',
        slug: (client as any).slug || '',
        oferta: (client as any).oferta || '',
        plan_type: (client as any).plan_type || 'starter',
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', document: '', slug: '', oferta: '', plan_type: 'starter' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      document: formData.document || null,
      slug: formData.slug || null,
      oferta: formData.oferta || null,
      plan_type: formData.plan_type,
      updated_at: new Date().toISOString(),
    };

    let err = null;
    if (editingClient) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editingClient.id);
      err = error;
    } else {
      const { error } = await supabase.from('clients').insert([payload]);
      err = error;
    }

    setSaving(false);
    if (!err) {
      handleCloseModal();
      fetchClients();
    } else {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('clients').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (!error) {
      setDeleteTarget(null);
      fetchClients();
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document?.includes(searchTerm)
  );

  const planBadgeVariant = (plan: string) => {
    if (plan === 'premium' || plan === 'enterprise') return 'active';
    if (plan === 'growth') return 'approved';
    return 'default';
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        title="Clientes"
        subtitle="Gerenciar empresas e pessoas atendidas"
        icon={<Users className="w-4 h-4" />}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
            Novo Cliente
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="Nenhum cliente encontrado"
          description={searchTerm ? 'Tente buscar com outros termos.' : 'Você ainda não possui clientes cadastrados.'}
          action={!searchTerm && <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>Novo Cliente</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="flex flex-col gap-3 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{client.name}</h3>
                    {(client as any).slug && (
                      <span className="text-xs text-gray-400 font-mono">/{(client as any).slug}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenModal(client)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(client)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-500 flex-1">
                {client.email && <div className="truncate">{client.email}</div>}
                {client.phone && <div>{client.phone}</div>}
                {(client as any).oferta && <div className="text-gray-400 truncate">{(client as any).oferta}</div>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Badge variant={planBadgeVariant((client as any).plan_type || 'starter')}>
                  {(client as any).plan_type || 'starter'}
                </Badge>
                <Link
                  to={`/admin/cliente/${client.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Ver perfil <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome da Empresa/Pessoa *"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Slug"
              type="text"
              placeholder="ex: computize"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            />
            <Select
              label="Plano"
              value={formData.plan_type}
              onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
            >
              {PLAN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <Input
            label="Oferta principal"
            type="text"
            placeholder="Gestão de redes sociais, etc."
            value={formData.oferta}
            onChange={(e) => setFormData({ ...formData, oferta: e.target.value })}
          />
          <Input
            label="Email de Contato"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="CPF / CNPJ"
              type="text"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir cliente"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja excluir <strong className="text-gray-900">{deleteTarget?.name}</strong>? Isso excluirá também páginas e formulários associados.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
