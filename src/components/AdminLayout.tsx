import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, FileText, LogOut, Loader2, Menu, X,
  Users, Globe, ClipboardList, CalendarDays, FileSearch, Layers
} from 'lucide-react';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!supabase) {
      navigate('/admin/login', { replace: true });
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/admin/login', { replace: true });
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', exact: true },
    { path: '/admin/clients', icon: <Users className="w-4 h-4" />, label: 'Clientes' },
    { path: '/admin/clientes', icon: <Layers className="w-4 h-4" />, label: 'Projetos & Rotas' },
    { path: '/admin/calendarios', icon: <CalendarDays className="w-4 h-4" />, label: 'Calendários' },
    { path: '/admin/site-pages', icon: <Globe className="w-4 h-4" />, label: 'Site (CMS)' },
    { path: '/admin/pages', icon: <Globe className="w-4 h-4" />, label: 'Páginas' },
    { path: '/admin/forms', icon: <ClipboardList className="w-4 h-4" />, label: 'Formulários' },
    { path: '/admin/emp', icon: <FileText className="w-4 h-4" />, label: 'Respostas EMP' },
  ];

  const isActive = (item: { path: string; exact?: boolean }) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  const SidebarContent = () => (
    <>
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="font-bold text-sm text-gray-900">Anti Copy Club</div>
        <div className="text-xs text-gray-400 mt-0.5">Admin Panel</div>
      </div>

      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair do Sistema
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <span className="font-bold text-sm text-gray-900">Anti Copy Admin</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 flex flex-col md:hidden pt-14">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
