import { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowUpFromLine, Clock, Search } from 'lucide-react';
import { issuesAPI, itemsAPI } from '../services/api';
import { Modal, PageHeader, EmptyState, LoadingPage, Pagination, SearchInput, TabBar, SkeletonTable } from '../components/ui';
import { formatDateTime, statusBadge, relativeTime } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { id: '',         label: 'All',       icon: null },
  { id: 'issued',   label: 'Issued',    icon: ArrowUpFromLine },
  { id: 'returned', label: 'Returned',  icon: null },
  { id: 'overdue',  label: 'Overdue',   icon: Clock },
  { id: 'partially_returned', label: 'Partial', icon: null },
];

export default function IssuesPage() {
  const { isInstituteAdmin, isLabIncharge } = useAuth();
  const canIssue = isInstituteAdmin || isLabIncharge;
  const [issues,     setIssues]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [status,     setStatus]     = useState('');
  const [search,     setSearch]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [items,      setItems]      = useState([]);
  const [form,       setForm]       = useState({ item:'', issuedTo:'', quantity:'', purpose:'', expectedReturnDate:'' });
  const [saving,     setSaving]     = useState(false);
  const [selItem,    setSelItem]    = useState(null);

  const fetchIssues = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (status) params.status = status;
    if (search) params.search = search;
    issuesAPI.getAll(params)
      .then(res => { setIssues(res.data.data); setPagination(res.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const openModal = async () => {
    try {
      const [ir] = await Promise.all([itemsAPI.getAll({ limit:100 })]);
      setItems(ir.data.data);
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

  const handleStatusChange = (s) => { setStatus(s); setPage(1); };
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Issue Items" subtitle="Issue lab items to students and track status"
        action={canIssue && <button onClick={openModal} className="btn-primary"><Plus size={16}/>Issue Item</button>} />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-5 items-start">
        <TabBar
          tabs={STATUS_TABS.map(t => ({ ...t, count: undefined }))}
          active={status}
          onChange={handleStatusChange}
        />
        <SearchInput value={search} onChange={handleSearch} placeholder="Search items, users..." />
      </div>

      <div className="card">
        {loading ? <SkeletonTable rows={8} cols={7} /> : issues.length === 0 ? (
          <EmptyState icon={ArrowUpFromLine} title="No issues found" subtitle={status ? `No ${status} issues` : "Issue items to students to see them here"} />
        ) : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>Item</th><th>Issued To</th><th>Issued By</th>
                  <th>Quantity</th><th>Date</th><th>Expected Return</th><th>Status</th><th>Purpose</th>
                </tr></thead>
                <tbody>
                  {issues.map(issue => {
                    const isOverdue = issue.status === 'overdue';
                    return (
                      <tr key={issue._id} className={isOverdue ? 'bg-red-50/50 dark:bg-red-500/5' : ''}>
                        <td>
                          <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{issue.item?.name}</div>
                          <div className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{issue.item?.itemCode}</div>
                        </td>
                        <td>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{issue.issuedTo?.name}</span>
                        </td>
                        <td>{issue.issuedBy?.name}</td>
                        <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{issue.quantity} {issue.item?.unit}</td>
                        <td>
                          <span title={formatDateTime(issue.issueDate)}>{relativeTime(issue.issueDate)}</span>
                        </td>
                        <td>
                          {issue.expectedReturnDate ? (
                            <span className={isOverdue ? 'text-red-500 font-bold' : ''}>
                              {new Date(issue.expectedReturnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              {isOverdue && <Clock size={12} className="inline ml-1 animate-pulse" />}
                            </span>
                          ) : '—'}
                        </td>
                        <td><span className={statusBadge(issue.status)}>{issue.status?.replace('_',' ')}</span></td>
                        <td className="max-w-32 truncate" style={{ color: 'var(--text-tertiary)' }}>{issue.purpose || '—'}</td>
                      </tr>
                    );
                  })}
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
            {selItem && (
              <div className="flex items-center gap-2 mt-2 text-xs p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Available:</span>
                <span className="font-bold text-brand-600">{selItem.quantity} {selItem.unit}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>· {selItem.storageLocation || 'No location'}</span>
              </div>
            )}
          </div>
          <div>
            <label className="label">Issue To (Name) *</label>
            <input className="input" placeholder="e.g. Rahul Kumar" value={form.issuedTo}
              onChange={e => setForm(p => ({...p, issuedTo: e.target.value}))} required />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Enter the exact name of the registered user</p>
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
