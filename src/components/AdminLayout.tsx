import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, FileText, LogOut, Loader2, Menu, X,
  Users, Globe, ClipboardList, CalendarDays, Layers,
  CheckSquare, UserCog
} from 'lucide-react';
import { AdminRoleContext } from '../context/AdminRoleContext';
import { EmployeeRole } from '../types';

type NavItem = {
  path: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
  roles?: EmployeeRole[]; // undefined = todos os roles
};

const ALL_NAV_ITEMS: NavItem[] = [
  { path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', exact: true },
  { path: '/admin/clients', icon: <Users className="w-4 h-4" />, label: 'Clientes', roles: ['admin', 'gestor', 'editor'] },
  { path: '/admin/clientes', icon: <Layers className="w-4 h-4" />, label: 'Projetos & Rotas', roles: ['admin', 'gestor'] },
  { path: '/admin/calendarios', icon: <CalendarDays className="w-4 h-4" />, label: 'Calendários' },
  { path: '/admin/tarefas', icon: <CheckSquare className="w-4 h-4" />, label: 'Tarefas' },
  { path: '/admin/site-pages', icon: <Globe className="w-4 h-4" />, label: 'Site (CMS)', roles: ['admin', 'gestor', 'editor'] },
  { path: '/admin/pages', icon: <Globe className="w-4 h-4" />, label: 'Páginas', roles: ['admin', 'gestor'] },
  { path: '/admin/forms', icon: <ClipboardList className="w-4 h-4" />, label: 'Formulários', roles: ['admin', 'gestor', 'editor'] },
  { path: '/admin/emp', icon: <FileText className="w-4 h-4" />, label: 'Respostas EMP', roles: ['admin', 'gestor', 'editor'] },
  { path: '/admin/equipe', icon: <UserCog className="w-4 h-4" />, label: 'Equipe', roles: ['admin'] },
];

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<EmployeeRole | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
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
        setLoading(false);
        return;
      }

      // Fetch employee role
      const email = session.user.email;
      if (email) {
        const { data: emp } = await supabase
          .from('employees')
          .select('id, name, role')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (emp) {
          setRole(emp.role as EmployeeRole);
          setEmployeeId(emp.id);
          setEmployeeName(emp.name);
        } else {
          // Not in employees — check if this is a portal-only user.
          // Use error handling so a missing table (404) doesn't block admin access.
          const { data: clientUser, error: cuError } = await supabase
            .from('client_users')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!cuError) {
            // Table exists — check result
            if (clientUser) {
              navigate('/portal/login', { replace: true });
              setLoading(false);
              return;
            }
            // Not found in client_users — also check by email (pre-first-login)
            const { data: clientByEmail } = await supabase
              .from('clients')
              .select('id')
              .eq('email', email)
              .maybeSingle();

            if (clientByEmail) {
              navigate('/portal/login', { replace: true });
              setLoading(false);
              return;
            }
          }
          // cuError (table doesn't exist yet) or no match → treat as owner/superuser
        }
      }

      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin/login', { replace: true });
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

  // Filter nav by role (null role = not in employees table = treat as admin)
  const navItems = ALL_NAV_ITEMS.filter(item => {
    if (!item.roles) return true; // visible to all
    if (!role) return true;       // not in employees table → admin
    return item.roles.includes(role);
  });

  const isActive = (item: NavItem) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  const roleLabel: Record<EmployeeRole, string> = {
    admin: 'Admin',
    gestor: 'Gestor',
    editor: 'Editor',
    social_media: 'Social Media',
  };

  const SidebarContent = () => (
    <>
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="font-bold text-sm text-gray-900">Anti Copy Club</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {role ? roleLabel[role] : 'Admin Panel'}
          {employeeName && <span className="ml-1 text-gray-300">· {employeeName.split(' ')[0]}</span>}
        </div>
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
    <AdminRoleContext.Provider value={{ role, employeeId, employeeName }}>
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
    </AdminRoleContext.Provider>
  );
}
