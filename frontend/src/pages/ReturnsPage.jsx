import { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowDownToLine, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { returnsAPI, issuesAPI } from '../services/api';
import { Modal, PageHeader, EmptyState, LoadingPage, Pagination, SkeletonTable } from '../components/ui';
import { formatDateTime, condBadge, relativeTime } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const COND_CONFIG = {
  good:    { label: 'Good', desc: 'Full stock will be restored',            icon: CheckCircle,   cls: 'border-emerald-300 dark:border-emerald-500/30', active: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-400/30', text: 'text-emerald-700 dark:text-emerald-400' },
  damaged: { label: 'Damaged', desc: '50% stock restored + damage report', icon: AlertTriangle, cls: 'border-amber-300 dark:border-amber-500/30',   active: 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-400/30',    text: 'text-amber-700 dark:text-amber-400' },
  broken:  { label: 'Broken', desc: 'No stock restored + damage report',   icon: XCircle,       cls: 'border-red-300 dark:border-red-500/30',       active: 'border-red-500 bg-red-50 dark:bg-red-500/10 ring-2 ring-red-400/30',          text: 'text-red-700 dark:text-red-400' },
};

export default function ReturnsPage() {
  const { isInstituteAdmin, isLabIncharge } = useAuth();
  const canReturn = isInstituteAdmin || isLabIncharge;
  const [returns,    setReturns]    = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [openIssues, setOpenIssues] = useState([]);
  const [form,       setForm]       = useState({ issue:'', quantityReturned:'', condition:'good', notes:'' });
  const [saving,     setSaving]     = useState(false);
  const [selIssue,   setSelIssue]   = useState(null);

  const fetchReturns = useCallback(() => {
    setLoading(true);
    returnsAPI.getAll({ page, limit: 15 })
      .then(res => { setReturns(res.data.data); setPagination(res.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const openModal = async () => {
    try {
      const res = await issuesAPI.getAll({ status: 'issued', limit: 100 });
      const overdueRes = await issuesAPI.getAll({ status: 'overdue', limit: 100 });
      const partialRes = await issuesAPI.getAll({ status: 'partially_returned', limit: 100 });
      setOpenIssues([...res.data.data, ...overdueRes.data.data, ...partialRes.data.data]);
      setForm({ issue:'', quantityReturned:'', condition:'good', notes:'' });
      setSelIssue(null);
      setModalOpen(true);
    } catch { toast.error('Failed to load open issues'); }
  };

  const handleIssueChange = (id) => {
    const found = openIssues.find(i => i._id === id);
    setSelIssue(found || null);
    setForm(p => ({ ...p, issue: id, quantityReturned: found?.quantity || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await returnsAPI.create(form);
      toast.success('Return recorded successfully');
      setModalOpen(false);
      fetchReturns();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to record return'); }
    finally { setSaving(false); }
  };

  // Summary stats from current returns
  const condCounts = returns.reduce((acc, r) => {
    acc[r.condition] = (acc[r.condition] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <PageHeader title="Returns" subtitle="Record item returns from students"
        action={canReturn && <button onClick={openModal} className="btn-primary"><Plus size={16}/>Record Return</button>} />

      {/* Summary stats */}
      {returns.length > 0 && (
        <div className="flex gap-3 mb-5">
          {Object.entries(COND_CONFIG).map(([key, cfg]) => (
            <div key={key} className="card px-4 py-3 flex items-center gap-2.5">
              <cfg.icon size={16} className={cfg.text} />
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{condCounts[key] || 0}</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        {loading ? <SkeletonTable rows={8} cols={6} /> : returns.length === 0 ? (
          <EmptyState icon={ArrowDownToLine} title="No returns yet" subtitle="Record returns when students bring items back" />
        ) : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>Item</th><th>Returned By</th><th>Received By</th>
                  <th>Quantity</th><th>Condition</th><th>Return Date</th><th>Notes</th>
                </tr></thead>
                <tbody>
                  {returns.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{r.item?.name}</div>
                      </td>
                      <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.returnedBy?.name}</td>
                      <td>{r.receivedBy?.name}</td>
                      <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{r.quantityReturned} {r.item?.unit}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {r.condition === 'good' && <CheckCircle size={14} className="text-emerald-500" />}
                          {r.condition === 'damaged' && <AlertTriangle size={14} className="text-amber-500" />}
                          {r.condition === 'broken' && <XCircle size={14} className="text-red-500" />}
                          <span className={condBadge(r.condition)}>{r.condition}</span>
                        </div>
                      </td>
                      <td title={formatDateTime(r.returnDate)}>{relativeTime(r.returnDate)}</td>
                      <td className="max-w-40 truncate" style={{ color: 'var(--text-tertiary)' }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3"><Pagination pagination={pagination} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Item Return">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Select Issue Record *</label>
            <select className="input" value={form.issue} onChange={e => handleIssueChange(e.target.value)} required>
              <option value="">Choose issued item...</option>
              {openIssues.map(i => (
                <option key={i._id} value={i._id}>
                  {i.item?.name} — {i.issuedTo?.name} ({i.quantity} {i.item?.unit}) [{i.status}]
                </option>
              ))}
            </select>
            {selIssue && (
              <div className="text-xs p-2.5 rounded-xl mt-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Issued qty:</span>{' '}
                <span className="font-bold text-brand-600">{selIssue.quantity} {selIssue.item?.unit}</span>{' '}
                <span style={{ color: 'var(--text-tertiary)' }}>· Status: {selIssue.status}</span>
              </div>
            )}
          </div>
          <div>
            <label className="label">Quantity Returned *</label>
            <input type="number" min="0.01" step="0.01" className="input"
              value={form.quantityReturned} max={selIssue?.quantity}
              onChange={e => setForm(p => ({...p, quantityReturned:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Condition *</label>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {Object.entries(COND_CONFIG).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setForm(p => ({...p, condition: key}))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    form.condition === key ? cfg.active : cfg.cls
                  }`}>
                  <cfg.icon size={20} className={cfg.text} />
                  <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                  <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-tertiary)' }}>{cfg.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Describe condition..."
              value={form.notes} onChange={e => setForm(p => ({...p, notes:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Recording...' : 'Record Return'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
