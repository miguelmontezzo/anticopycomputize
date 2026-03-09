import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, LogOut, CalendarDays, Bell as BellIcon, Users2, Menu, X, CheckSquare } from 'lucide-react';
import { ClientPortalContext, PortalClient, PortalNotification } from '../context/ClientPortalContext';

export default function PortalLayout() {
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [client, setClient] = useState<PortalClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const loadNotifications = useCallback(async (clientId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotifications(data as PortalNotification[]);
  }, []);

  const loadPendingApprovals = useCallback(async (clientId: string) => {
    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .in('workflow_status', ['client_review', 'client_approval']);
    setPendingApprovals(count || 0);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/portal/login', { replace: true });
        setLoading(false);
        return;
      }

      setUser(session.user);

      const { data: cu } = await supabase
        .from('client_users')
        .select('client_id, clients(id, name, slug, email, plan_type, portal_enabled)')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (cu?.clients) {
        const c = cu.clients as any;
        setClient(c);
        loadNotifications(c.id);
        loadPendingApprovals(c.id);
        setLoading(false);
        return;
      }

      const { data: clientByEmail } = await supabase
        .from('clients')
        .select('id, name, slug, email, plan_type, portal_enabled')
        .eq('email', session.user.email!)
        .maybeSingle();

      if (clientByEmail) {
        await supabase.from('client_users').insert({
          user_id: session.user.id,
          client_id: clientByEmail.id,
        });
        setClient(clientByEmail as PortalClient);
        loadNotifications(clientByEmail.id);
        loadPendingApprovals(clientByEmail.id);
      } else {
        setUnauthorized(true);
      }

      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/portal/login', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, loadNotifications, loadPendingApprovals]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/portal/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <X className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Acesso não autorizado</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          Este email não está associado a nenhum cliente. Entre em contato com a agência.
        </p>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 underline">
          Sair
        </button>
      </div>
    );
  }

  const slug = client?.slug || '';
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navLinks = [
    { to: `/portal/${slug}/calendario`, label: 'Calendário', icon: <CalendarDays className="w-4 h-4" /> },
    { to: `/portal/${slug}/aprovacoes`, label: 'Aprovações', icon: <CheckSquare className="w-4 h-4" />, badge: pendingApprovals },
    { to: `/portal/${slug}/notificacoes`, label: 'Notificações', icon: <BellIcon className="w-4 h-4" />, badge: unreadCount },
    { to: `/portal/${slug}/reunioes`, label: 'Reuniões', icon: <Users2 className="w-4 h-4" /> },
  ];

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  const NavLinks = () => (
    <>
      {navLinks.map(link => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
            isActive(link.to)
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {link.icon}
          {link.label}
          {link.badge ? (
            <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {link.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </>
  );

  return (
    <ClientPortalContext.Provider value={{
      client, user, notifications, unreadCount,
      refreshNotifications: () => client && loadNotifications(client.id),
      markAsRead,
    }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-bold text-sm text-gray-900 shrink-0">Anti Copy Club</span>
              {client && (
                <>
                  <span className="text-gray-300 text-sm">/</span>
                  <span className="text-sm text-gray-500 truncate">{client.name}</span>
                </>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
            </nav>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1 bg-white">
              <NavLinks />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </ClientPortalContext.Provider>
  );
}
