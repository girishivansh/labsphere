import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowUpFromLine, ArrowDownToLine,
  FileBarChart, Users, LogOut, FlaskConical, Menu, X,
  ShieldCheck, BookOpen, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// Each nav item visible only to specific roles
const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   roles: ['admin','teacher','student'] },
  { to: '/inventory',  icon: Package,          label: 'Inventory',   roles: ['admin','teacher','student'] },
  { to: '/issues',     icon: ArrowUpFromLine,  label: 'Issue Items', roles: ['admin','teacher'] },
  { to: '/returns',    icon: ArrowDownToLine,  label: 'Returns',     roles: ['admin','teacher'] },
  { to: '/reports',    icon: FileBarChart,     label: 'Reports',     roles: ['admin','teacher'] },
  { to: '/users',      icon: Users,            label: 'Users',       roles: ['admin'] },
];

const ROLE_META = {
  admin:   { label: 'Admin',         icon: ShieldCheck,   color: 'bg-purple-100 text-purple-700' },
  teacher: { label: 'Lab In-charge', icon: BookOpen,      color: 'bg-blue-100 text-blue-700' },
  student: { label: 'Student',       icon: GraduationCap, color: 'bg-green-100 text-green-700' },
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen]  = useState(false);
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Only show nav items allowed for this user's role
  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(user?.role));
  const roleMeta   = ROLE_META[user?.role] || {};

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-60">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
          <FlaskConical size={18} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm">LabSphere</div>
          <div className="text-xs text-slate-400">Inventory System</div>
        </div>
        {mobile && (
          <button onClick={() => setOpen(false)} className="ml-auto btn-ghost p-1 rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${roleMeta.color}`}>
          {roleMeta.icon && <roleMeta.icon size={13} />}
          {roleMeta.label} Portal
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</p>
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
            }>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{user?.name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="nav-item nav-item-inactive w-full text-red-500 hover:bg-red-50 hover:text-red-600 mt-1">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 fade-in">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden btn-ghost p-2 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </div>
          {/* Role badge in header */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${roleMeta.color}`}>
            {roleMeta.icon && <roleMeta.icon size={12} />}
            {roleMeta.label}
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
