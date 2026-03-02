import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserCog, Plus, Loader2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Employee, EmployeeRole } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { Input, Select } from '../components/ui/Input';

const ROLES: { value: EmployeeRole; label: string; desc: string }[] = [
  { value: 'admin', label: 'Admin', desc: 'Acesso total ao painel' },
  { value: 'gestor', label: 'Gestor de Conta', desc: 'Tudo exceto Equipe' },
  { value: 'editor', label: 'Editor de Conteúdo', desc: 'Calendários, Tarefas, EMP, Clientes (leitura)' },
  { value: 'social_media', label: 'Social Media', desc: 'Calendários e Tarefas atribuídas' },
];

const roleBadge = (role: EmployeeRole) => {
  if (role === 'admin') return 'active' as const;
  if (role === 'gestor') return 'approved' as const;
  if (role === 'editor') return 'pending' as const;
  return 'default' as const;
};

const roleLabel: Record<EmployeeRole, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  editor: 'Editor',
  social_media: 'Social Media',
};

const emptyForm = { name: '', email: '', role: 'editor' as EmployeeRole };

export default function AdminTeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: EmployeeRole }>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEmployees(data as Employee[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, role: emp.role });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from('employees')
        .update({ name: form.name, email: form.email, role: form.role })
        .eq('id', editing.id);
      if (error) alert('Erro: ' + error.message);
    } else {
      const { error } = await supabase
        .from('employees')
        .insert([{ name: form.name, email: form.email, role: form.role }]);
      if (error) alert('Erro: ' + error.message);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const toggleActive = async (emp: Employee) => {
    setToggling(emp.id);
    await supabase
      .from('employees')
      .update({ is_active: !emp.is_active })
      .eq('id', emp.id);
    setToggling(null);
    load();
  };

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        title="Equipe"
        subtitle="Gerencie os membros da agência e seus acessos"
        icon={<UserCog className="w-4 h-4" />}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Adicionar membro
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={<UserCog className="w-5 h-5" />}
          title="Nenhum membro cadastrado"
          description="Adicione membros da equipe para controlar o acesso ao painel."
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Adicionar membro</Button>}
        />
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_140px_80px_40px] gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <span>Membro</span>
            <span>Role</span>
            <span>Status</span>
            <span />
          </div>

          {employees.map(emp => (
            <Card key={emp.id} className={`grid grid-cols-[1fr_140px_80px_40px] gap-4 items-center ${!emp.is_active ? 'opacity-50' : ''}`}>
              {/* Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {initials(emp.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{emp.name}</div>
                  <div className="text-xs text-gray-400 truncate">{emp.email}</div>
                </div>
              </div>

              {/* Role */}
              <Badge variant={roleBadge(emp.role)}>{roleLabel[emp.role]}</Badge>

              {/* Status */}
              <Badge variant={emp.is_active ? 'approved' : 'inactive'}>
                {emp.is_active ? 'Ativo' : 'Inativo'}
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => openEdit(emp)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleActive(emp)}
                  disabled={toggling === emp.id}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title={emp.is_active ? 'Desativar' : 'Ativar'}
                >
                  {toggling === emp.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : emp.is_active
                      ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                      : <ToggleLeft className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Roles info box */}
      <div className="mt-8 p-4 bg-gray-100 rounded-xl">
        <p className="text-xs font-semibold text-gray-600 mb-3">Permissões por role</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ROLES.map(r => (
            <div key={r.value} className="flex items-start gap-2">
              <Badge variant={roleBadge(r.value)} className="shrink-0 mt-0.5">{r.label}</Badge>
              <span className="text-xs text-gray-500">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar membro' : 'Novo membro'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome completo *"
            type="text"
            required
            value={form.name}
            onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
          />
          <Input
            label="Email *"
            type="email"
            required
            value={form.email}
            onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
          />
          <Select
            label="Role *"
            value={form.role}
            onChange={e => setForm(s => ({ ...s, role: e.target.value as EmployeeRole }))}
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
            ))}
          </Select>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
