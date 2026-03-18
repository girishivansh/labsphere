import { useEffect, useState } from 'react';
import { Package, AlertTriangle, ArrowUpFromLine, ArrowDownToLine, TrendingUp } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { StatCard, LoadingPage } from '../components/ui';
import { formatDateTime } from '../utils/helpers';

export default function DashboardPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Low stock alert */}
      {stats?.lowStockItems > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <AlertTriangle size={17} className="text-amber-500 flex-shrink-0" />
          <span className="text-sm font-semibold">
            {stats.lowStockItems} item{stats.lowStockItems > 1 ? 's are' : ' is'} running low on stock
          </span>
          <a href="/inventory" className="ml-auto text-xs font-bold text-amber-700 hover:underline">View →</a>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items"     value={stats?.totalItems}     icon={Package}          color="blue" />
        <StatCard label="Low Stock"       value={stats?.lowStockItems}  icon={AlertTriangle}    color="red" />
        <StatCard label="Issued Today"    value={stats?.issuedToday}    icon={ArrowUpFromLine}  color="yellow" />
        <StatCard label="Returned Today"  value={stats?.returnedToday}  icon={ArrowDownToLine}  color="green" />
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-600" />
          <h2 className="font-semibold text-slate-800 text-sm">Recent Activity</h2>
        </div>
        {stats?.recentActivity?.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {stats.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.type === 'issue' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                  {a.type === 'issue' ? <ArrowUpFromLine size={14} /> : <ArrowDownToLine size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{a.itemName}</p>
                  <p className="text-xs text-slate-400">
                    {a.type === 'issue' ? 'Issued to' : 'Returned by'} {a.userName} · {a.quantity} {a.unit}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(a.date)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
