import { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowRightLeft, Activity, Search } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { Spinner } from '../components/ui';
import { formatCompact, formatDate, relativeTime, hazardBadge, statusBadge } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(err => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  if (!stats) return <div className="text-center p-10">Error loading dashboard</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Here's what's happening in your lab today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Items" value={stats.totalItems} icon={Package} color="var(--brand-500)" />
        <StatCard title="Active Issues" value={stats.activeIssues} icon={Activity} color="#3b82f6" />
        <StatCard title="Low Stock Items" value={stats.lowStockItems} icon={AlertTriangle} color="#f59e0b" />
        <StatCard title="Overdue Returns" value={stats.overdueCount} icon={ArrowRightLeft} color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
            <div className="space-y-4">
              {stats.recentActivity?.length > 0 ? stats.recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.type === 'issue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {act.type === 'issue' ? <Activity size={18} /> : <ArrowRightLeft size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {act.userName} {act.type === 'issue' ? 'was issued' : 'returned'} {act.quantity} {act.unit}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{act.itemName}</p>
                  </div>
                  <div className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {relativeTime(act.date)}
                  </div>
                </div>
              )) : (
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No recent activity</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
            <div className="space-y-3">
              <a href="/issues" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-md transition-all no-underline">
                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center"><Activity size={16} className="text-brand-600" /></div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Issue Item</span>
              </a>
              <a href="/returns" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-md transition-all no-underline">
                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center"><ArrowRightLeft size={16} className="text-brand-600" /></div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Receive Return</span>
              </a>
              <a href="/inventory" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-md transition-all no-underline">
                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center"><Package size={16} className="text-brand-600" /></div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Add Inventory</span>
              </a>
            </div>
          </div>
        </div>
      </div>
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
