import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FlaskConical, User, Mail, Phone, Lock, Eye, EyeOff, Building2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState({ instituteName: '', name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await signup({ instituteName: form.instituteName, name: form.name, email: form.email, password: form.password });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center gap-3 mb-8 no-underline">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <FlaskConical size={20} className="text-white" />
          </div>
          <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>LabSphere</span>
        </Link>

        <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Create your institute</h2>
        <p className="text-sm mt-1.5 mb-6" style={{ color: 'var(--text-tertiary)' }}>Set up your lab management account</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="label">Institute Name</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input className="input pl-10" placeholder="e.g. IIT Delhi" value={form.instituteName} onChange={set('instituteName')} required />
            </div>
          </div>
          <div>
            <label className="label">Your Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input className="input pl-10" placeholder="Dr. John Doe" value={form.name} onChange={set('name')} required />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type="email" className="input pl-10" placeholder="you@inst.edu" value={form.email} onChange={set('email')} required />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type={showPass ? 'text' : 'password'} className="input pl-10" placeholder="Min 6 chars"
                  value={form.password} onChange={set('password')} required />
              </div>
            </div>
            <div>
              <label className="label">Confirm</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type={showPass ? 'text' : 'password'} className="input pl-10" placeholder="Re-enter"
                  value={form.confirm} onChange={set('confirm')} required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'var(--text-tertiary)' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-fade-in">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">
            {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-tertiary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 no-underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
