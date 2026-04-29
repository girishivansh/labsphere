import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { roleLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    authAPI.getInviteInfo(token)
      .then(res => setInviteInfo(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Invalid or expired invite link'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      const res = await authAPI.acceptInvite(token, { password });
      const { token: jwtToken } = res.data.data;
      localStorage.setItem('labsphere-token', jwtToken);
      toast.success('Account activated successfully!');
      // Force reload to update auth context
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate account');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full text-center p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Invalid Link</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>{error}</p>
          <Link to="/" className="btn-primary inline-flex">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 mb-6">
            <CheckCircle size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>You've been invited!</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>Set up your password to activate your account</p>
        </div>

        <div className="p-6 rounded-2xl mb-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-brand-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Institute</p>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{inviteInfo?.institute?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User size={16} className="text-brand-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Role</p>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{roleLabel(inviteInfo?.role)}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Set a Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input type={showPass ? 'text' : 'password'} className="input pl-10" placeholder="Minimum 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg disabled:opacity-60 flex items-center justify-center">
            {submitting ? 'Activating...' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
