import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Eye, EyeOff, ShieldCheck, GraduationCap, BookOpen, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ROLES = [
  {
    role: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    desc: 'Full system access',
    color: 'border-purple-300 bg-purple-50 text-purple-700',
    activeColor: 'border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    role: 'teacher',
    label: 'Lab In-charge',
    icon: BookOpen,
    desc: 'Manage inventory & issues',
    color: 'border-blue-300 bg-blue-50 text-blue-700',
    activeColor: 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    role: 'student',
    label: 'Student',
    icon: GraduationCap,
    desc: 'View inventory only',
    color: 'border-green-300 bg-green-50 text-green-700',
    activeColor: 'border-green-500 bg-green-600 text-white shadow-lg shadow-green-200',
    badgeColor: 'bg-green-100 text-green-700',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [form,      setForm]      = useState({ email: '', password: '' });
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setForm({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);

      // STRICT ROLE CHECK — user must login via their own portal only
      if (loggedInUser.role !== selectedRole) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError(
          `Access denied. This is the "${selectedRole}" portal. Your account role is "${loggedInUser.role}". Please select the correct portal.`
        );
        setLoading(false);
        return;
      }

      toast.success(`Welcome, ${loggedInUser.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = ROLES.find(r => r.role === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-brand-600 items-center justify-center mb-4 shadow-2xl shadow-brand-500/30">
            <FlaskConical size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LabSphere</h1>
          <p className="text-slate-400 text-sm mt-1">Your Complete Lab Management Solution</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Step 1 - Role Selection */}
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Step 1 — Select Your Portal
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map(({ role, label, icon: Icon, desc, color, activeColor }) => (
                <button key={role} type="button" onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selectedRole === role ? activeColor : color}`}>
                  <Icon size={22} />
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-xs leading-tight text-center opacity-75">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 - Credentials */}
          <div className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Step 2 — Enter Credentials
            </p>

            {!selectedRole && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-200">
                <Lock size={15} className="text-slate-400 flex-shrink-0" />
                <p className="text-sm text-slate-400">Select a portal above to continue</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedRoleData && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${selectedRoleData.badgeColor}`}>
                  <selectedRoleData.icon size={13} />
                  Logging in as: <span className="font-bold">{selectedRoleData.label}</span>
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" className="input pl-9" placeholder="your@email.com"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    disabled={!selectedRole} required />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="••••••••"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    disabled={!selectedRole} required />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || !selectedRole}
                className="btn-primary w-full justify-center py-3 text-sm font-bold disabled:opacity-40">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg> Verifying...</>
                ) : selectedRole ? `Sign In as ${selectedRoleData?.label}` : 'Select a Portal First'}
              </button>
            </form>
          </div>

         
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          🔒 Secured with JWT Authentication · Role-based Access Control <br /> <strong>Designed & Developed by Shivansh Giri (Lead Developer)</strong>
        </p>
      </div>
    </div>
  );
}
