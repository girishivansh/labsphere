import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full text-center animate-scale-in">
        {/* Animated shield icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto animate-pulse-slow">
            <ShieldX size={44} className="text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-lg font-black animate-bounce">
            !
          </div>
        </div>

        <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          You don't have permission to access this page.
        </p>
        {user && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Logged in as</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
            <span className="badge badge-purple text-xs">{user.role}</span>
          </div>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            <Home size={16} /> Go to Dashboard
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-secondary">
            Login as Different User
          </button>
        </div>
      </div>
    </div>
  );
}
