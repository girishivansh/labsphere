import { useState, useEffect } from 'react';
import { Building2, Users, Package, AlertTriangle, TrendingUp, ShieldCheck, Activity, Search, MoreVertical } from 'lucide-react';
import { institutesAPI } from '../services/api';
import { Spinner, Pagination } from '../components/ui';
import { formatCompact, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SuperAdminPage() {
  const [stats, setStats] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchStats();
    fetchInstitutes(1);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchInstitutes(1, search), 300);
    return () => clearTimeout(delay);
  }, [search]);

  const fetchStats = async () => {
    try {
      const res = await institutesAPI.getStats();
      setStats(res.data.data);
    } catch (err) { toast.error('Failed to load stats'); }
  };

  const fetchInstitutes = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await institutesAPI.getAll({ page, limit: 10, search: searchQuery });
      setInstitutes(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { toast.error('Failed to load institutes'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus} this institute?`)) return;
    try {
      await institutesAPI.updateStatus(id, { status: newStatus });
      toast.success(`Institute ${newStatus}`);
      fetchInstitutes(pagination.page);
      fetchStats();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const deleteInstitute = async (id, name) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE "${name}"?\n\nThis will remove the institute AND all its users, inventory, issues, returns, and damage reports.\n\nThis action CANNOT be undone.`)) return;
    try {
      const res = await institutesAPI.delete(id);
      toast.success(res.data.message);
      fetchInstitutes(pagination.page);
      fetchStats();
    } catch (err) { toast.error('Failed to delete institute'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Super Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Platform-wide overview and tenant management</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Institutes" value={stats.totalInstitutes} icon={Building2} color="var(--brand-500)" />
          <StatCard title="Active Institutes" value={stats.activeInstitutes} icon={Activity} color="#10b981" />
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#3b82f6" />
          <StatCard title="Total Inventory Items" value={formatCompact(stats.totalItems)} icon={Package} color="#8b5cf6" />
        </div>
      ) : <Spinner />}

      <div className="card flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Institutes</h2>
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" className="input pl-10" placeholder="Search institutes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="card p-10 flex justify-center"><Spinner /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-6 py-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Institute</th>
                  <th className="px-6 py-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Admin Email</th>
                  <th className="px-6 py-4 font-bold text-center" style={{ color: 'var(--text-secondary)' }}>Members</th>
                  <th className="px-6 py-4 font-bold text-center" style={{ color: 'var(--text-secondary)' }}>Items</th>
                  <th className="px-6 py-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="px-6 py-4 font-bold text-right" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                {institutes.map(inst => (
                  <tr key={inst._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{inst.name}</div>
                      <div className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{inst.instituteId}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{inst.email}</td>
                    <td className="px-6 py-4 text-center font-bold" style={{ color: 'var(--text-primary)' }}>{inst.memberCount || 0}</td>
                    <td className="px-6 py-4 text-center font-bold" style={{ color: 'var(--text-primary)' }}>{inst.itemCount || 0}</td>
                    <td className="px-6 py-4">
                      {inst.status === 'active' ? <span className="badge badge-green">Active</span> :
                       inst.status === 'suspended' ? <span className="badge badge-red">Suspended</span> :
                       <span className="badge badge-yellow">Pending</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleStatus(inst._id, inst.status)} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                          {inst.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button onClick={() => deleteInstitute(inst._id, inst.name)} className="text-xs font-bold text-red-500 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Pagination page={pagination.page} pages={pagination.pages} onPageChange={p => fetchInstitutes(p)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-xl transition-all group">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>{title}</p>
        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
