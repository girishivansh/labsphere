import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm mb-1">
          You don't have permission to access this page.
        </p>
        {user && (
          <p className="text-xs text-slate-400 mb-6">
            Logged in as <span className="font-semibold text-slate-600">{user.name}</span>
            {' '}(<span className="capitalize text-brand-600 font-semibold">{user.role}</span>)
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            <ArrowLeft size={15} /> Go to Dashboard
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn-secondary"
          >
            Login as Different User
          </button>
        </div>
      </div>
    </div>
  );
}
