import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LayoutDashboard, FileText, LogOut, Loader2, Menu, X } from 'lucide-react';

export default function AdminLayout() {
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
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
        await supabase.auth.signOut();
        navigate('/admin/login', { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
            </div>
        );
    }

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/admin/emp', icon: <FileText className="w-5 h-5" />, label: 'Respostas EMP' },
    ];

    return (
        <div className="min-h-screen bg-bg-primary text-white flex overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-black/50 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4">
                <div className="font-bold tracking-widest text-xs uppercase text-accent-cyan">
                    Anti Copy Admin
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: sidebarOpen ? 0 : (window.innerWidth < 768 ? '-100%' : 0) }}
                className="fixed md:static inset-y-0 left-0 z-40 w-64 bg-black/80 md:bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col pt-16 md:pt-0 transition-transform duration-300 md:translate-x-0"
            >
                <div className="p-6 hidden md:block">
                    <div className="font-bold tracking-widest text-xs uppercase text-accent-cyan mb-1">
                        Anti Copy Club
                    </div>
                    <div className="text-[10px] text-muted tracking-widest uppercase">
                        Admin Panel
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                                        : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair do Sistema
                    </button>
                </div>
            </motion.aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed md:hidden inset-0 bg-black/60 z-30 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto pt-16 md:pt-0 scroll-smooth">
                {/* Global Glows for Admin Pages */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] glow-purple opacity-10" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] glow-cyan opacity-10" />
                </div>

                <div className="relative z-10 w-full h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
