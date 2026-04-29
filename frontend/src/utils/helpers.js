// ── Date Formatting ──────────────────────────────────────────────────
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const relativeTime = (d) => {
  if (!d) return '—';
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(d);
};

// ── Number Formatting ────────────────────────────────────────────────
export const formatCompact = (num) => {
  if (num === null || num === undefined) return '—';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ── Stock Helpers ────────────────────────────────────────────────────
export const isLowStock = (item) => parseFloat(item.quantity) <= parseFloat(item.minimumLimit);

export const stockPercent = (item) => {
  if (!item.minimumLimit || item.minimumLimit === 0) return 100;
  return Math.min(100, Math.round((item.quantity / (item.minimumLimit * 2)) * 100));
};

// ── Badge Class Helpers ──────────────────────────────────────────────
export const hazardBadge = (h) => ({ low:'badge-green', medium:'badge-yellow', high:'badge-red', extreme:'badge-purple' }[h] || 'badge-gray');
export const condBadge   = (c) => ({ good:'badge-green', damaged:'badge-yellow', broken:'badge-red' }[c] || 'badge-gray');
export const statusBadge = (s) => ({ issued:'badge-blue', returned:'badge-green', overdue:'badge-red', partially_returned:'badge-yellow' }[s] || 'badge-gray');
export const roleBadge   = (r) => ({ SUPER_ADMIN:'badge-red', INSTITUTE_ADMIN:'badge-purple', LAB_INCHARGE:'badge-blue', STUDENT:'badge-green' }[r] || 'badge-gray');

export const roleLabel   = (r) => ({ SUPER_ADMIN:'Super Admin', INSTITUTE_ADMIN:'Institute Admin', LAB_INCHARGE:'Lab Incharge', STUDENT:'Student' }[r] || r);

// ── Chart Colors ─────────────────────────────────────────────────────
export const CHART_COLORS = {
  blue:    { bg: 'rgba(27, 92, 245, 0.15)', border: '#1b5cf5' },
  green:   { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' },
  red:     { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
  amber:   { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
  violet:  { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6' },
  cyan:    { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4' },
};

// ── CSV Export ────────────────────────────────────────────────────────
export const exportToCSV = (data, headers, filename) => {
  const headerRow = headers.map(h => h.label).join(',');
  const rows = data.map(row =>
    headers.map(h => {
      const val = typeof h.accessor === 'function' ? h.accessor(row) : row[h.accessor];
      // Escape commas and quotes in CSV
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  const csv = [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
