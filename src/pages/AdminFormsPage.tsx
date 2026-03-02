import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClipboardList, Plus, Loader2, Search, Edit2, Trash2, Settings2 } from 'lucide-react';
import { Form, Client, Page } from '../types';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { Input, Textarea, Select } from '../components/ui/Input';

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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [formsRes, clientsRes, pagesRes] = await Promise.all([
      supabase.from('forms').select('*, clients(name), pages(title)').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('name', { ascending: true }),
      supabase.from('pages').select('*').order('title', { ascending: true }),
    ]);
    if (formsRes.data) setForms(formsRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    if (pagesRes.data) setPages(pagesRes.data);
    setLoading(false);
  };

  const handleOpenModal = (form?: Form) => {
    if (form) {
      setEditingForm(form);
      setFormData({ client_id: form.client_id, page_id: form.page_id || '', title: form.title, description: form.description || '' });
    } else {
      setEditingForm(null);
      setFormData({ client_id: clients[0]?.id || '', page_id: '', title: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingForm(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      client_id: formData.client_id,
      page_id: formData.page_id || null,
      title: formData.title,
      description: formData.description,
    };
    if (editingForm) {
      const { error } = await supabase.from('forms').update(payload).eq('id', editingForm.id);
      if (!error) { handleCloseModal(); fetchData(); } else alert('Erro: ' + error.message);
    } else {
      const { data, error } = await supabase.from('forms').insert([payload]).select().single();
      if (!error && data) { handleCloseModal(); fetchData(); navigate(`/admin/forms/${data.id}`); }
      else alert('Erro: ' + error?.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Excluir o formulário '${title}'? Isso excluirá campos e respostas.`)) {
      const { error } = await supabase.from('forms').delete().eq('id', id);
      if (!error) fetchData(); else alert('Erro: ' + error.message);
    }
  };

  const filteredForms = forms.filter(f =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader
        title="Formulários e Leads"
        subtitle="Crie formulários dinâmicos associados aos clientes"
        icon={<ClipboardList className="w-4 h-4" />}
        action={
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal()}
            disabled={clients.length === 0}
          >
            Novo Formulário
          </Button>
        }
      />

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar formulário ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filteredForms.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-5 h-5" />}
          title="Nenhum formulário encontrado"
          description={searchTerm ? 'Tente buscar com outros termos.' : 'Crie seu primeiro formulário.'}
          action={!searchTerm && clients.length > 0 ? <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>Novo Formulário</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredForms.map(form => (
            <Card key={form.id} className="flex flex-col gap-3 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{form.title}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">{form.clients?.name || 'Cliente desconhecido'}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/admin/forms/${form.id}`)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar campos"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(form)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Configurações"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(form.id, form.title)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {form.description && (
                <p className="text-xs text-gray-500 line-clamp-2 flex-1">{form.description}</p>
              )}
              {form.pages && (
                <div className="text-xs text-gray-400">
                  Página: <span className="text-gray-600">{form.pages.title}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/admin/forms/${form.id}/responses`)}
                  className="w-full py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Ver Respostas (Leads)
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingForm ? 'Opções do Formulário' : 'Novo Formulário'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Título do Formulário *"
            type="text"
            required
            placeholder="Ex: Contato — Landing Page"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Textarea
            label="Descrição"
            placeholder="Instruções ou subtítulo..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Cliente *"
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value, page_id: '' })}
            >
              <option value="" disabled>Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select
              label="Página (opcional)"
              value={formData.page_id}
              onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
              disabled={!formData.client_id}
            >
              <option value="">Nenhuma</option>
              {pages.filter(p => p.client_id === formData.client_id).map(p => (
                <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Salvando...' : (editingForm ? 'Salvar' : 'Criar Formulário')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
