import { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowUpFromLine } from 'lucide-react';
import { issuesAPI, itemsAPI, usersAPI } from '../services/api';
import { Modal, PageHeader, EmptyState, LoadingPage, Pagination } from '../components/ui';
import { formatDateTime, statusBadge } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function IssuesPage() {
  const [issues,     setIssues]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [items,      setItems]      = useState([]);
  const [users,      setUsers]      = useState([]);
  const [form,       setForm]       = useState({ item:'', issuedTo:'', quantity:'', purpose:'', expectedReturnDate:'' });
  const [saving,     setSaving]     = useState(false);
  const [selItem,    setSelItem]    = useState(null);

  const fetchIssues = useCallback(() => {
    setLoading(true);
    issuesAPI.getAll({ page, limit: 15 })
      .then(res => { setIssues(res.data.data); setPagination(res.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const openModal = async () => {
    try {
      const [ir, ur] = await Promise.all([itemsAPI.getAll({ limit:100 }), usersAPI.getAll()]);
      setItems(ir.data.data);
      setUsers(ur.data.data.filter(u => u.role !== 'admin'));
      setForm({ item:'', issuedTo:'', quantity:'', purpose:'', expectedReturnDate:'' });
      setSelItem(null);
      setModalOpen(true);
    } catch { toast.error('Failed to load data'); }
  };

  const handleItemChange = (id) => {
    const found = items.find(i => i._id === id);
    setSelItem(found || null);
    setForm(p => ({ ...p, item: id, quantity: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await issuesAPI.create(form);
      toast.success('Item issued successfully');
      setModalOpen(false);
      fetchIssues();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to issue item'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Issue Items" subtitle="Issue lab items to students"
        action={<button onClick={openModal} className="btn-primary"><Plus size={16}/>Issue Item</button>} />

      <div className="card">
        {loading ? <LoadingPage /> : issues.length === 0 ? (
          <EmptyState icon={ArrowUpFromLine} title="No issues yet" subtitle="Issue items to students to see them here" />
        ) : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>Item</th><th>Issued To</th><th>Issued By</th>
                  <th>Quantity</th><th>Date</th><th>Expected Return</th><th>Status</th><th>Purpose</th>
                </tr></thead>
                <tbody>
                  {issues.map(issue => (
                    <tr key={issue._id}>
                      <td><div className="font-semibold text-slate-800">{issue.item?.name}</div><div className="text-xs text-slate-400 font-mono">{issue.item?.itemCode}</div></td>
                      <td>{issue.issuedTo?.name}</td>
                      <td className="text-slate-500">{issue.issuedBy?.name}</td>
                      <td className="font-semibold">{issue.quantity} {issue.item?.unit}</td>
                      <td className="text-slate-500">{formatDateTime(issue.issueDate)}</td>
                      <td className="text-slate-500">{issue.expectedReturnDate ? new Date(issue.expectedReturnDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td><span className={statusBadge(issue.status)}>{issue.status?.replace('_',' ')}</span></td>
                      <td className="text-slate-400 max-w-32 truncate">{issue.purpose || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3"><Pagination pagination={pagination} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Issue Item to Student">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Select Item *</label>
            <select className="input" value={form.item} onChange={e => handleItemChange(e.target.value)} required>
              <option value="">Choose item...</option>
              {items.map(i => <option key={i._id} value={i._id}>{i.name} ({i.itemCode}) — {i.quantity} {i.unit} available</option>)}
            </select>
            {selItem && <p className="text-xs text-slate-500 mt-1">Available: <span className="font-bold text-brand-600">{selItem.quantity} {selItem.unit}</span> · Location: {selItem.storageLocation || 'N/A'}</p>}
          </div>
          <div>
            <label className="label">Issue To (Student / Teacher Name) *</label>
            <input
              className="input"
              placeholder="e.g. Rahul Kumar"
              value={form.issuedTo}
              onChange={e => setForm(p => ({...p, issuedTo: e.target.value}))}
              required
            />
          </div>
          <div>
            <label className="label">Quantity *</label>
            <input type="number" min="0.01" step="0.01" max={selItem?.quantity} className="input"
              value={form.quantity} onChange={e => setForm(p => ({...p, quantity:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Expected Return Date</label>
            <input type="date" className="input" value={form.expectedReturnDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(p => ({...p, expectedReturnDate:e.target.value}))} />
          </div>
          <div>
            <label className="label">Purpose</label>
            <input className="input" placeholder="e.g. Titration experiment" value={form.purpose} onChange={e => setForm(p => ({...p, purpose:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Issuing...' : 'Issue Item'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
