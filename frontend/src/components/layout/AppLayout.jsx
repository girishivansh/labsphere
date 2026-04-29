import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowUpFromLine, ArrowDownToLine,
  FileBarChart, Users, LogOut, FlaskConical, Menu, X,
  ShieldCheck, BookOpen, GraduationCap, Moon, Sun, ChevronLeft, Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/super-admin', icon: Building2,        label: 'Platform',    roles: ['SUPER_ADMIN'] },
  { to: '/dashboard',   icon: LayoutDashboard,  label: 'Dashboard',   roles: ['INSTITUTE_ADMIN','LAB_INCHARGE','STUDENT'] },
  { to: '/inventory',   icon: Package,          label: 'Inventory',   roles: ['INSTITUTE_ADMIN','LAB_INCHARGE','STUDENT'] },
  { to: '/issues',      icon: ArrowUpFromLine,  label: 'Issue Items', roles: ['INSTITUTE_ADMIN','LAB_INCHARGE','STUDENT'] },
  { to: '/returns',     icon: ArrowDownToLine,  label: 'Returns',     roles: ['INSTITUTE_ADMIN','LAB_INCHARGE','STUDENT'] },
  { to: '/reports',     icon: FileBarChart,     label: 'Reports',     roles: ['INSTITUTE_ADMIN','LAB_INCHARGE'] },
  { to: '/members',     icon: Users,            label: 'Members',     roles: ['INSTITUTE_ADMIN'] },
];

const ROLE_META = {
  SUPER_ADMIN:     { label: 'Super Admin',     icon: ShieldCheck,   gradient: 'from-red-500 to-rose-600',       light: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
  INSTITUTE_ADMIN: { label: 'Institute Admin', icon: Building2,     gradient: 'from-violet-500 to-purple-600',  light: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' },
  LAB_INCHARGE:    { label: 'Lab In-charge',   icon: BookOpen,      gradient: 'from-blue-500 to-cyan-500',      light: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  STUDENT:         { label: 'Student',         icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500',   light: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
};

export default function AppLayout({ children }) {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(user?.role));
  const roleMeta   = ROLE_META[user?.role] || {};

  const currentPageTitle = NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label || 'LabSphere';

  const SidebarContent = ({ mobile = false }) => (
    <div className={`flex flex-col h-full transition-all duration-300 ${collapsed && !mobile ? 'w-[72px]' : 'w-64'}`} style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${roleMeta.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center flex-shrink-0 shadow-glow-sm`}>
          <FlaskConical size={20} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="animate-fade-in">
            <div className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>LabSphere</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Lab Management</div>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto btn-ghost p-1.5 rounded-xl">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      {(!collapsed || mobile) && (
        <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${roleMeta.light}`}>
            {roleMeta.icon && <roleMeta.icon size={14} />}
            {roleMeta.label} Portal
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {(!collapsed || mobile) && (
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-2" style={{ color: 'var(--text-tertiary)' }}>Menu</p>
        )}
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'} ${collapsed && !mobile ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}>
            <Icon size={18} />
            {(!collapsed || mobile) && <span className="animate-fade-in">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border-light)' }}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleMeta.gradient || 'from-brand-500 to-brand-700'} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-tertiary)' }}>
                {user?.institute?.name ? user.institute.name : user?.role}
              </div>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`nav-item nav-item-inactive w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 ${collapsed && !mobile ? 'justify-center px-0' : ''}`}>
          <LogOut size={17} />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0 relative">
        <SidebarContent />
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3 top-20 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={12} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 animate-slide-in-right">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3.5 flex-shrink-0" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden btn-ghost p-2 rounded-xl">
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{currentPageTitle}</h2>
          </div>

          <div className="flex-1" />

          <div className="text-sm hidden sm:block" style={{ color: 'var(--text-tertiary)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </div>

          {/* Dark mode toggle */}
          <button onClick={toggleDarkMode} className="btn-ghost p-2.5 rounded-xl" title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Role badge */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${roleMeta.light}`}>
            {roleMeta.icon && <roleMeta.icon size={13} />}
            {roleMeta.label}
          </div>

          {/* Avatar */}
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleMeta.gradient || 'from-brand-500 to-brand-700'} text-white font-bold text-sm flex items-center justify-center cursor-pointer hover:shadow-glow-sm transition-shadow`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
