import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, RotateCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const email = useLocation().state?.email;

  useEffect(() => { if (!email) navigate('/login'); else inputs.current[0]?.focus(); }, [email, navigate]);
  useEffect(() => { if (countdown <= 0) return; const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    val = val.slice(-1);
    const next = [...otp]; next[i] = val; setOtp(next); setError('');
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (val && i === 5) doSubmit(next.join(''));
  };
  const handleKeyDown = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus(); };
  const handlePaste = (e) => { const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (p.length === 6) { setOtp(p.split('')); doSubmit(p); } };

  const doSubmit = async (code) => {
    if ((code || otp.join('')).length !== 6) { setError('Enter 6-digit OTP'); return; }
    setLoading(true);
    try { await verifyOtp(email, code || otp.join('')); toast.success('Verified!'); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); setOtp(['','','','','','']); inputs.current[0]?.focus(); }
    finally { setLoading(false); }
  };

  const resend = async () => { try { await authAPI.resendOtp({ email, type: 'signup' }); setCountdown(60); toast.success('OTP resent!'); } catch { toast.error('Failed'); } };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Verify your email</h2>
        <p className="text-sm mt-2 mb-8" style={{ color: 'var(--text-tertiary)' }}>Code sent to <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{email}</span></p>
        <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input key={i} ref={el => inputs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
              value={d} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: d ? 'var(--brand-600)' : 'var(--border)', color: 'var(--text-primary)' }} />
          ))}
        </div>
        {error && <div className="p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl"><p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p></div>}
        <button onClick={() => doSubmit()} disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg cursor-pointer disabled:opacity-60">{loading ? 'Verifying...' : 'Verify & Continue'}</button>
        <div className="mt-6">{countdown > 0 ? <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Resend in <b>{countdown}s</b></p> : <button onClick={resend} className="text-xs font-semibold text-brand-600 flex items-center gap-1.5 mx-auto cursor-pointer"><RotateCw size={12} /> Resend OTP</button>}</div>
        <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}><b>Dev:</b> Check server console for OTP</p>
      </div>
    </div>
  );
}
