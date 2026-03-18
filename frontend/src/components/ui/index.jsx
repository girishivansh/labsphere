export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <svg className={`animate-spin text-brand-600 ${s}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
};

export const LoadingPage = () => (
  <div className="flex items-center justify-center h-60">
    <Spinner size="lg" />
  </div>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const StatCard = ({ label, value, icon: Icon, color = 'blue', sub }) => {
  const colors = { blue:'bg-blue-50 text-blue-600', green:'bg-green-50 text-green-600', red:'bg-red-50 text-red-600', yellow:'bg-yellow-50 text-yellow-600', purple:'bg-purple-50 text-purple-600' };
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon size={28} className="text-slate-400" />
    </div>
    <p className="font-semibold text-slate-700">{title}</p>
    {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} fade-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="btn-ghost rounded-lg text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm fade-in p-6">
        <h2 className="font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1">
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">Showing {from}–{to} of {total}</p>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5">Prev</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium ${p === page ? 'bg-brand-600 text-white' : 'btn-secondary'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === pages} className="btn-secondary text-xs px-3 py-1.5">Next</button>
      </div>
    </div>
  );
};
