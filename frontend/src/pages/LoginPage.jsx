import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FlaskConical, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Beaker, Microscope, TestTubes } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4c1d95 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)' }} />
          <Beaker size={28} className="absolute top-[15%] right-[15%] text-white/[0.06] animate-float" />
          <Microscope size={32} className="absolute top-[45%] right-[25%] text-white/[0.06] animate-float" style={{ animationDelay: '2s' }} />
          <TestTubes size={26} className="absolute bottom-[25%] right-[12%] text-white/[0.06] animate-float" style={{ animationDelay: '4s' }} />
          <FlaskConical size={30} className="absolute top-[30%] left-[12%] text-white/[0.06] animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <FlaskConical size={22} className="text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">LabSphere</span>
          </Link>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm font-bold text-violet-300/80 uppercase tracking-[0.2em] mb-3">Multi-Tenant Lab Platform</p>
            <h1 className="text-4xl xl:text-[42px] font-black text-white leading-[1.15] tracking-tight">
              Sign in to<br />manage your<br />
              <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">laboratory.</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed max-w-sm mt-5">
              One platform for every role — admins, lab incharges, and students. All under one login.
            </p>
            <div className="flex gap-8 mt-10">
              {[{ value: '4', label: 'User Roles' }, { value: '🔒', label: 'Encrypted' }, { value: '🏛️', label: 'Multi-tenant' }].map((s, i) => (
                <div key={i}><div className="text-2xl font-black text-white">{s.value}</div><div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div></div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-600">Designed & Developed by <span className="text-slate-400 font-semibold">Shivansh Giri</span></div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] animate-fade-in">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <FlaskConical size={20} className="text-white" />
            </div>
            <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>LabSphere</span>
          </div>

          <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-sm mt-1.5 mb-8" style={{ color: 'var(--text-tertiary)' }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type="email" className="input pl-10" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type={showPass ? 'text' : 'password'} className="input pl-10 pr-11" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'var(--text-tertiary)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</Link>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-fade-in">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">
              {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>)
                : (<>Sign In <ArrowRight size={16} /></>)}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>New here?</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          <Link to="/signup" className="w-full py-3 rounded-xl text-sm font-bold border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-2 no-underline">
            Create Institute Account
          </Link>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs font-semibold text-brand-600 hover:text-brand-700 no-underline">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
