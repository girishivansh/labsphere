export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const isLowStock = (item) => parseFloat(item.quantity) <= parseFloat(item.minimumLimit);

export const hazardBadge = (h) => ({ low:'badge-green', medium:'badge-yellow', high:'badge-red', extreme:'badge-purple' }[h] || 'badge-gray');
export const condBadge   = (c) => ({ good:'badge-green', damaged:'badge-yellow', broken:'badge-red' }[c] || 'badge-gray');
export const statusBadge = (s) => ({ issued:'badge-blue', returned:'badge-green', overdue:'badge-red', partially_returned:'badge-yellow' }[s] || 'badge-gray');
export const roleBadge   = (r) => ({ admin:'badge-purple', teacher:'badge-blue', student:'badge-green' }[r] || 'badge-gray');
