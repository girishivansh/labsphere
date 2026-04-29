import { useNavigate, Link } from 'react-router-dom';
import {
  FlaskConical, Package, ArrowUpFromLine, ArrowDownToLine, FileBarChart,
  Shield, Zap, Users, QrCode, BarChart3, Moon, Sun, ArrowRight,
  CheckCircle, Beaker, Microscope, TestTubes, ChevronRight, Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  {
    icon: Package,
    title: 'Smart Inventory',
    desc: 'Track chemicals and equipment with real-time stock levels, hazard classifications, and auto-generated QR codes.',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
  },
  {
    icon: ArrowUpFromLine,
    title: 'Issue & Return',
    desc: 'Streamlined checkout workflow with automatic stock deduction, overdue tracking, and partial return support.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FileBarChart,
    title: 'Reports & Analytics',
    desc: 'Daily, monthly, and low-stock reports with interactive charts. Export data as CSV with one click.',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    desc: 'Multi-tenant access control — Institute Admin, Lab Incharge, and Student portals with granular permissions.',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
  },
  {
    icon: QrCode,
    title: 'QR Code Tracking',
    desc: 'Every item gets a unique QR code automatically. Scan to view details, history, and current status.',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500/10',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard',
    desc: 'Real-time overview with animated stats, weekly trends, item distribution charts, and recent activity feed.',
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-500/10',
  },
];

const ROLES_INFO = [
  { icon: Shield, role: 'Institute Admin', desc: 'Full tenant access, member management, item CRUD, all reports', color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/20' },
  { icon: Beaker, role: 'Lab Incharge', desc: 'Manage inventory, issue/return items, view reports and analytics', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
  { icon: Users, role: 'Student', desc: 'View available inventory, track personally issued items', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
];

export default function HomePage() {
  const { user, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md shadow-violet-500/20">
              <FlaskConical size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">LabSphere</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode}
              className="btn-ghost p-2.5 rounded-xl" title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
                Dashboard <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-primary text-sm">
                Sign In <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
          <div className="absolute top-40 right-[5%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 left-[30%] w-[600px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold animate-fade-in"
              style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <Zap size={13} className="text-amber-500" />
              Complete Lab Management Solution
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight animate-slide-up">
              Your lab,{' '}
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                organized
              </span>
              <br />and under control.
            </h1>

            <p className="text-base lg:text-lg mt-5 max-w-xl mx-auto leading-relaxed animate-slide-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.1s' }}>
              LabSphere is a powerful inventory management system built for chemistry labs. 
              Track chemicals, equipment, issue/returns, and generate reports — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="btn-primary text-base px-7 py-3.5 shadow-xl shadow-brand-600/20 hover:shadow-brand-600/30">
                {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={18} />
              </button>
              <a href="#features" className="btn-secondary text-base px-7 py-3.5">
                Explore Features
              </a>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: Package, value: 'Chemicals', label: '& Equipment' },
                { icon: Zap, value: 'Real-time', label: 'Tracking' },
                { icon: Shield, value: 'Role-based', label: 'Access Control' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <s.icon size={16} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 text-xs font-bold"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <Star size={12} className="text-amber-500" /> Key Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
              Everything you need to<br />
              <span className="gradient-text">manage your lab</span>
            </h2>
            <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: 'var(--text-tertiary)' }}>
              Built with modern technologies for speed, security, and simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, gradient, bg }, i) => (
              <div key={i} className="card p-6 hover-lift group" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <Icon size={22} />
                  </div>
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles Section ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
              Built for <span className="gradient-text">every role</span>
            </h2>
            <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: 'var(--text-tertiary)' }}>
              Three-tier role-based access control ensures everyone sees exactly what they need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {ROLES_INFO.map(({ icon: Icon, role, desc, color, bg, border }, i) => (
              <div key={i} className={`card p-6 hover-lift border-2 ${border}`}>
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={26} className={color} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{role}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-tertiary)' }}>{desc}</p>
                <ul className="space-y-2">
                  {(role === 'Institute Admin'
                    ? ['Full CRUD', 'Member management', 'All reports']
                    : role === 'Lab Incharge'
                    ? ['Issue & Return', 'View reports', 'Manage inventory']
                    : ['View inventory', 'Track items', 'See issued items']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-tertiary)' }}>Powered By</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {['MongoDB', 'Express.js', 'React', 'Node.js', 'Tailwind CSS', 'Chart.js'].map((tech, i) => (
              <div key={i} className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 text-center"
            style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4c1d95 100%)' }}>
            {/* Decorative */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)' }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto">
                Sign in to your portal and start managing your laboratory with confidence.
              </p>
              <button onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all shadow-xl cursor-pointer">
                {user ? 'Go to Dashboard' : 'Sign In Now'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <FlaskConical size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>LabSphere</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} LabSphere · Designed & Developed by <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Shivansh Giri</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
