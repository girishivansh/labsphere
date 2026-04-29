import { useState, useEffect, useRef } from 'react';

// ── Animated Counter ──────────────────────────────────────────────────
export const AnimatedCounter = ({ value, duration = 600 }) => {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    if (value === null || value === undefined) return;
    const start = prevValue.current;
    const end = typeof value === 'number' ? value : parseInt(value) || 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else prevValue.current = end;
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{display}</span>;
};

// ── Spinner ───────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <svg className={`animate-spin text-brand-600 ${s}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
};

// ── Skeleton Loader ───────────────────────────────────────────────────
export const Skeleton = ({ className = '', count = 1 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`skeleton h-4 ${className}`} />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-3 w-1/3" />
    <div className="skeleton h-8 w-1/2" />
    <div className="skeleton h-3 w-2/3" />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="skeleton h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// ── Loading Page ──────────────────────────────────────────────────────
export const LoadingPage = () => (
  <div className="flex flex-col items-center justify-center h-60 gap-3">
    <Spinner size="lg" />
    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
  </div>
);

// ── Page Header ───────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'blue', sub, trend }) => {
  const gradients = {
    blue:   'from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10',
    green:  'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10',
    red:    'from-red-500/10 to-red-600/5 dark:from-red-500/20 dark:to-red-600/10',
    yellow: 'from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10',
    purple: 'from-violet-500/10 to-violet-600/5 dark:from-violet-500/20 dark:to-violet-600/10',
  };
  const iconColors = {
    blue:   'text-blue-600 dark:text-blue-400',
    green:  'text-emerald-600 dark:text-emerald-400',
    red:    'text-red-600 dark:text-red-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    purple: 'text-violet-600 dark:text-violet-400',
  };
  return (
    <div className={`card p-5 hover-lift bg-gradient-to-br ${gradients[color]} overflow-hidden relative group`}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
          <p className="text-3xl font-extrabold mt-1.5" style={{ color: 'var(--text-primary)' }}>
            <AnimatedCounter value={value} />
          </p>
          {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1.5 font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconColors[color]} bg-white/60 dark:bg-white/5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <Icon size={32} style={{ color: 'var(--text-tertiary)' }} />
    </div>
    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</p>
    {subtitle && <p className="text-sm mt-1.5 max-w-xs" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} animate-scale-in max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl`} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost rounded-xl p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ── Confirm Dialog ────────────────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-scale-in p-6 rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-bold text-center text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
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

// ── Pagination ────────────────────────────────────────────────────────
export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Smart page window
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) { range.unshift(1); if (range[1] > 2) range.splice(1, 0, '...'); }
    if (range[range.length - 1] < pages) {
      if (range[range.length - 1] < pages - 1) range.push('...');
      range.push(pages);
    }
    return range;
  };

  return (
    <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Showing {from}–{to} of {total}</p>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 rounded-lg">Prev</button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 py-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>...</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${p === page ? 'btn-primary' : 'btn-secondary'}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === pages} className="btn-secondary text-xs px-3 py-1.5 rounded-lg">Next</button>
      </div>
    </div>
  );
};

// ── Search Input ──────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => {
  const [local, setLocal] = useState(value || '');
  const timer = useRef(null);

  useEffect(() => { setLocal(value || ''); }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 300);
  };

  return (
    <div className="relative flex-1 min-w-[200px]">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input className="input pl-10 pr-8" placeholder={placeholder} value={local} onChange={handleChange} />
      {local && (
        <button onClick={() => { setLocal(''); onChange(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
};

// ── Tab Bar ───────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 p-1.5 rounded-2xl w-fit mb-6" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
    {tabs.map(({ id, label, icon: Icon, count }) => (
      <button key={id} onClick={() => onChange(id)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          active === id ? 'btn-primary shadow-glow-sm' : ''
        }`}
        style={active !== id ? { color: 'var(--text-secondary)' } : {}}>
        {Icon && <Icon size={15} />}
        <span className="hidden sm:inline">{label}</span>
        {count !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded-md ${active === id ? 'bg-white/20' : 'bg-black/5 dark:bg-white/5'}`}>{count}</span>
        )}
      </button>
    ))}
  </div>
);
