import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: form.email });
      toast.success('OTP sent if email exists');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ email: form.email, otp: form.otp, newPassword: form.newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/20">
          <KeyRound size={28} className="text-white" />
        </div>

        <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Reset Password</h2>
        <p className="text-sm mt-2 mb-8" style={{ color: 'var(--text-tertiary)' }}>
          {step === 1 ? "Enter your email to receive a reset code." : "Enter the 6-digit code and your new password."}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type="email" className="input pl-10" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="label">OTP Code</label>
              <input type="text" className="input text-center tracking-[0.5em] font-bold text-lg" placeholder="••••••" maxLength={6}
                value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type={showPass ? 'text' : 'password'} className="input pl-10" placeholder="Min 6 chars"
                  value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? 'Resetting...' : <>Reset Password <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-xs font-semibold text-brand-600 hover:text-brand-700">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
