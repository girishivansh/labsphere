import { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowDownToLine } from 'lucide-react';
import { returnsAPI, issuesAPI } from '../services/api';
import { Modal, PageHeader, EmptyState, LoadingPage, Pagination } from '../components/ui';
import { formatDateTime, condBadge } from '../utils/helpers';
import toast from 'react-hot-toast';

const COND_INFO = {
  good:    { label: 'Good — full stock will be restored',              cls: 'text-green-700 bg-green-50' },
  damaged: { label: 'Damaged — 50% stock restored + damage report',   cls: 'text-yellow-700 bg-yellow-50' },
  broken:  { label: 'Broken — no stock restored + damage report',     cls: 'text-red-700 bg-red-50' },
};

export default function ReturnsPage() {
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
      setOpenIssues(res.data.data);
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

  return (
    <div>
      <PageHeader title="Returns" subtitle="Record item returns from students"
        action={<button onClick={openModal} className="btn-primary"><Plus size={16}/>Record Return</button>} />

      <div className="card">
        {loading ? <LoadingPage /> : returns.length === 0 ? (
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
                      <td><div className="font-semibold text-slate-800">{r.item?.name}</div></td>
                      <td>{r.returnedBy?.name}</td>
                      <td className="text-slate-500">{r.receivedBy?.name}</td>
                      <td className="font-semibold">{r.quantityReturned} {r.item?.unit}</td>
                      <td><span className={condBadge(r.condition)}>{r.condition}</span></td>
                      <td className="text-slate-500">{formatDateTime(r.returnDate)}</td>
                      <td className="text-slate-400 max-w-40 truncate">{r.notes || '—'}</td>
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
              {openIssues.map(i => <option key={i._id} value={i._id}>{i.item?.name} — {i.issuedTo?.name} ({i.quantity} {i.item?.unit})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity Returned *</label>
            <input type="number" min="0.01" step="0.01" className="input"
              value={form.quantityReturned} max={selIssue?.quantity}
              onChange={e => setForm(p => ({...p, quantityReturned:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Condition *</label>
            <select className="input" value={form.condition} onChange={e => setForm(p => ({...p, condition:e.target.value}))}>
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="broken">Broken</option>
            </select>
            {form.condition && (
              <p className={`text-xs mt-1.5 px-3 py-1.5 rounded-lg ${COND_INFO[form.condition].cls}`}>
                {COND_INFO[form.condition].label}
              </p>
            )}
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
