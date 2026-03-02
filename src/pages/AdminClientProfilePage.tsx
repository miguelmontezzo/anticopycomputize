import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, CalendarDays, ClipboardList, FileText, Loader2,
  Globe, Plus, ExternalLink, Copy, Check, Edit2,
  ToggleLeft, ToggleRight, Send, Bell, Trash2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';

type ClientExtended = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  slug?: string;
  oferta?: string;
  plan_type?: string;
  portal_enabled?: boolean;
  created_at: string;
};

type Calendar = {
  id: string;
  slug: string;
  title: string;
  week_start: string;
  week_end: string;
  status: string;
};

type Form = {
  id: string;
  title: string;
  description: string | null;
};

const PLAN_TYPES = ['starter', 'growth', 'premium', 'enterprise'];
const TABS = ['Visão Geral', 'Calendários', 'Formulários', 'EMP', 'Portal'] as const;
type Tab = typeof TABS[number];

export default function AdminClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Visão Geral');
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Portal state
  const [togglingPortal, setTogglingPortal] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [portalNotifs, setPortalNotifs] = useState<{id:string;title:string;message:string|null;is_read:boolean;created_at:string}[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [newNotifOpen, setNewNotifOpen] = useState(false);
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMessage, setNewNotifMessage] = useState('');
  const [savingNotif, setSavingNotif] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', document: '', slug: '', oferta: '', plan_type: 'starter'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    const [cRes, calRes, formRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('content_calendars').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('forms').select('id,title,description').eq('client_id', id).order('created_at', { ascending: false }),
    ]);

    if (cRes.data) {
      setClient(cRes.data);
      setEditForm({
        name: cRes.data.name || '',
        email: cRes.data.email || '',
        phone: cRes.data.phone || '',
        document: cRes.data.document || '',
        slug: cRes.data.slug || '',
        oferta: cRes.data.oferta || '',
        plan_type: cRes.data.plan_type || 'starter',
      });
    }
    if (calRes.data) setCalendars(calRes.data);
    if (formRes.data) setForms(formRes.data as Form[]);
    setLoading(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    const { error } = await supabase.from('clients').update({
      name: editForm.name,
      email: editForm.email || null,
      phone: editForm.phone || null,
      document: editForm.document || null,
      slug: editForm.slug || null,
      oferta: editForm.oferta || null,
      plan_type: editForm.plan_type,
      updated_at: new Date().toISOString(),
    }).eq('id', client.id);
    setSaving(false);
    if (!error) {
      setEditOpen(false);
      loadAll();
    } else {
      alert('Erro: ' + error.message);
    }
  };

  const loadPortalNotifs = async (clientId: string) => {
    setNotifsLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('id,title,message,is_read,created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setPortalNotifs(data as any);
    setNotifsLoading(false);
  };

  const togglePortal = async () => {
    if (!client) return;
    setTogglingPortal(true);
    const next = !client.portal_enabled;
    await supabase.from('clients').update({ portal_enabled: next }).eq('id', client.id);
    setClient(prev => prev ? { ...prev, portal_enabled: next } : prev);
    setTogglingPortal(false);
  };

  const sendPortalAccess = async () => {
    if (!client?.email) { alert('Configure o email do cliente primeiro.'); return; }
    setSendingLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: client.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/portal/callback`,
      },
    });
    setSendingLink(false);
    if (error) alert('Erro: ' + error.message);
    else alert(`Link de acesso enviado para ${client.email}`);
  };

  const saveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !newNotifTitle.trim()) return;
    setSavingNotif(true);
    await supabase.from('notifications').insert({
      client_id: client.id,
      type: 'info',
      title: newNotifTitle,
      message: newNotifMessage || null,
    });
    setSavingNotif(false);
    setNewNotifOpen(false);
    setNewNotifTitle('');
    setNewNotifMessage('');
    loadPortalNotifs(client.id);
  };

  const deleteNotif = async (notifId: string) => {
    await supabase.from('notifications').delete().eq('id', notifId);
    setPortalNotifs(prev => prev.filter(n => n.id !== notifId));
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-10 text-center text-gray-500">
        Cliente não encontrado.{' '}
        <Link to="/admin/clients" className="text-black underline">Voltar</Link>
      </div>
    );
  }

  const origin = window.location.origin;
  const slug = client.slug || '';

  const planVariant = (plan: string) => {
    if (plan === 'premium' || plan === 'enterprise') return 'active' as const;
    if (plan === 'growth') return 'approved' as const;
    return 'default' as const;
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        to="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Clientes
      </Link>

      {/* Client Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-bold">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
              <Badge variant={planVariant(client.plan_type || 'starter')}>
                {client.plan_type || 'starter'}
              </Badge>
            </div>
            {slug && <div className="text-sm text-gray-400 font-mono mt-0.5">/{slug}</div>}
            {client.email && <div className="text-sm text-gray-500 mt-0.5">{client.email}</div>}
          </div>
        </div>
        <Button
          variant="secondary"
          icon={<Edit2 className="w-4 h-4" />}
          onClick={() => setEditOpen(true)}
        >
          Editar dados
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Visão Geral' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-2xl font-bold text-gray-900">{calendars.length}</div>
            <div className="text-sm text-gray-500 mt-1">Calendários</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-gray-900">{forms.length}</div>
            <div className="text-sm text-gray-500 mt-1">Formulários</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-gray-900">—</div>
            <div className="text-sm text-gray-500 mt-1">Tarefas abertas</div>
          </Card>

          {client.oferta && (
            <Card className="col-span-full md:col-span-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Oferta</div>
              <div className="text-sm text-gray-700">{client.oferta}</div>
            </Card>
          )}

          {slug && (
            <Card className="col-span-full md:col-span-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Links rápidos</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: 'Apresentação', url: `${origin}/${slug}/ia-service` },
                  { label: 'Análise', url: `${origin}/${slug}/analise` },
                  { label: 'Form EMP', url: `${origin}/${slug}/emp` },
                  { label: 'Calendário público', url: `${origin}/calendario/${slug}` },
                ].map(link => (
                  <div key={link.url} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-600">{link.label}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copy(link.url)} className="text-gray-400 hover:text-gray-700">
                        {copied === link.url ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'Calendários' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link to="/admin/calendarios">
              <Button icon={<Plus className="w-4 h-4" />} variant="secondary" size="sm">
                Novo calendário
              </Button>
            </Link>
          </div>
          {calendars.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhum calendário criado para este cliente.
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {calendars.map(cal => (
                <Card key={cal.id} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{cal.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">/{cal.slug}</div>
                    <div className="text-xs text-gray-500 mt-1">{cal.week_start} → {cal.week_end}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={cal.status === 'active' ? 'active' : 'default'}>{cal.status}</Badge>
                    <Link to={`/admin/calendarios/${cal.id}`}>
                      <Button variant="secondary" size="sm">Editar posts</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Formulários' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link to="/admin/forms">
              <Button icon={<Plus className="w-4 h-4" />} variant="secondary" size="sm">
                Novo formulário
              </Button>
            </Link>
          </div>
          {forms.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhum formulário criado para este cliente.
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {forms.map(form => (
                <Card key={form.id} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{form.title}</div>
                    {form.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{form.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/admin/forms/${form.id}`}>
                      <Button variant="secondary" size="sm">Campos</Button>
                    </Link>
                    <Link to={`/admin/forms/${form.id}/responses`}>
                      <Button variant="ghost" size="sm">Respostas</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'EMP' && (
        <Card>
          <div className="text-sm text-gray-600 mb-4">
            Visualize o diagnóstico EMP enviado por este cliente.
          </div>
          <Link to="/admin/emp">
            <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>
              Ver Respostas EMP
            </Button>
          </Link>
        </Card>
      )}

      {tab === 'Portal' && (
        <div className="space-y-4">
          {/* Access toggle + URL */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">Acesso ao Portal</div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {client.portal_enabled ? 'Portal ativado — cliente pode fazer login' : 'Portal desativado'}
                </p>
              </div>
              <button
                onClick={togglePortal}
                disabled={togglingPortal}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-50 transition-colors"
                title={client.portal_enabled ? 'Desativar' : 'Ativar'}
              >
                {togglingPortal
                  ? <Loader2 className="w-6 h-6 animate-spin" />
                  : client.portal_enabled
                    ? <ToggleRight className="w-7 h-7 text-green-500" />
                    : <ToggleLeft className="w-7 h-7" />
                }
              </button>
            </div>

            {slug && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 min-w-0">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{origin}/portal/{slug}/calendario</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button onClick={() => copy(`${origin}/portal/${slug}/calendario`)} className="text-gray-400 hover:text-gray-700">
                    {copied === `${origin}/portal/${slug}/calendario`
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={`${origin}/portal/${slug}/calendario`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {client.email ? (
              <Button
                icon={<Send className="w-4 h-4" />}
                variant="secondary"
                loading={sendingLink}
                onClick={sendPortalAccess}
              >
                Enviar link de acesso para {client.email}
              </Button>
            ) : (
              <p className="text-xs text-amber-600">Configure o email do cliente para enviar o link de acesso.</p>
            )}
          </Card>

          {/* Notifications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">Notificações para o cliente</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => { setNewNotifOpen(true); loadPortalNotifs(client.id); }}
              >
                Nova
              </Button>
            </div>

            {notifsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : portalNotifs.length === 0 ? (
              <div
                className="text-center py-6 text-xs text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => { loadPortalNotifs(client.id); }}
              >
                Nenhuma notificação. Clique aqui para carregar ou crie uma nova.
              </div>
            ) : (
              <div className="space-y-2">
                {portalNotifs.map(n => (
                  <div key={n.id} className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 ${n.is_read ? 'border-gray-100 bg-gray-50/50' : 'border-black/10 bg-white'}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />}
                        <span className="text-xs font-medium text-gray-900 truncate">{n.title}</span>
                      </div>
                      {n.message && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>}
                      <div className="text-[10px] text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <button onClick={() => deleteNotif(n.id)} className="text-gray-300 hover:text-red-500 shrink-0 transition-colors mt-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* New Notification Modal */}
      <Modal open={newNotifOpen} onClose={() => setNewNotifOpen(false)} title="Nova notificação" size="sm">
        <form onSubmit={saveNotification} className="space-y-4">
          <Input
            label="Título *"
            type="text"
            required
            value={newNotifTitle}
            onChange={e => setNewNotifTitle(e.target.value)}
            placeholder="Ex: Novo calendário disponível para aprovação"
          />
          <Textarea
            label="Mensagem (opcional)"
            rows={3}
            value={newNotifMessage}
            onChange={e => setNewNotifMessage(e.target.value)}
            placeholder="Detalhes adicionais para o cliente..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setNewNotifOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={savingNotif}>Enviar</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Cliente" size="md">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Nome *"
            type="text"
            required
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Slug"
              type="text"
              value={editForm.slug}
              onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            />
            <Select
              label="Plano"
              value={editForm.plan_type}
              onChange={(e) => setEditForm({ ...editForm, plan_type: e.target.value })}
            >
              {PLAN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <Input
            label="Oferta"
            type="text"
            value={editForm.oferta}
            onChange={(e) => setEditForm({ ...editForm, oferta: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone"
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <Input
              label="CPF / CNPJ"
              value={editForm.document}
              onChange={(e) => setEditForm({ ...editForm, document: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
