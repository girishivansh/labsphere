import { useEffect, useState } from 'react';
import { FileBarChart, AlertTriangle, FileWarning, Calendar, TrendingUp } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { PageHeader, LoadingPage, EmptyState } from '../components/ui';
import { formatDateTime, condBadge } from '../utils/helpers';

const TABS = [
  { id:'daily',    label:'Daily Report',   icon: Calendar },
  { id:'monthly',  label:'Monthly Report', icon: TrendingUp },
  { id:'lowstock', label:'Low Stock',      icon: AlertTriangle },
  { id:'damage',   label:'Damage Reports', icon: FileWarning },
];

export default function ReportsPage() {
  const [tab,     setTab]     = useState('daily');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [month,   setMonth]   = useState(new Date().getMonth() + 1);
  const [year,    setYear]    = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [tab, date, month, year]);

  const fetchData = async () => {
    setLoading(true); setData(null);
    try {
      let res;
      if      (tab === 'daily')    res = await reportsAPI.getDaily({ date });
      else if (tab === 'monthly')  res = await reportsAPI.getMonthly({ month, year });
      else if (tab === 'lowstock') res = await reportsAPI.getLowStock();
      else if (tab === 'damage')   res = await reportsAPI.getDamage();
      setData(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Analytics and audit trail" />

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-white border border-slate-200 rounded-xl w-fit mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon size={15} /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {tab === 'daily' && (
        <div className="card p-4 mb-5 flex items-center gap-3">
          <label className="label mb-0 whitespace-nowrap">Select Date:</label>
          <input type="date" className="input w-auto" value={date} max={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} />
        </div>
      )}
      {tab === 'monthly' && (
        <div className="card p-4 mb-5 flex items-center gap-3 flex-wrap">
          <label className="label mb-0">Month:</label>
          <select className="input w-auto" value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{new Date(2000,m-1).toLocaleString('default',{month:'long'})}</option>)}
          </select>
          <select className="input w-auto" value={year} onChange={e => setYear(e.target.value)}>
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      <div className="card">
        {loading ? <LoadingPage /> : (
          <>
            {/* Daily */}
            {tab === 'daily' && data && (
              <div className="p-5 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"/>Issues ({data.issues?.length || 0})
                  </h3>
                  {data.issues?.length > 0 ? (
                    <div className="tbl-wrap"><table>
                      <thead><tr><th>Item</th><th>Issued To</th><th>Qty</th><th>Purpose</th><th>Time</th></tr></thead>
                      <tbody>{data.issues.map(i => (
                        <tr key={i._id}>
                          <td className="font-semibold">{i.item?.name}</td>
                          <td>{i.issuedTo?.name}</td>
                          <td>{i.quantity} {i.item?.unit}</td>
                          <td className="text-slate-400">{i.purpose||'—'}</td>
                          <td className="text-slate-400">{formatDateTime(i.issueDate)}</td>
                        </tr>
                      ))}</tbody>
                    </table></div>
                  ) : <p className="text-sm text-slate-400">No issues on this date</p>}
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"/>Returns ({data.returns?.length || 0})
                  </h3>
                  {data.returns?.length > 0 ? (
                    <div className="tbl-wrap"><table>
                      <thead><tr><th>Item</th><th>Returned By</th><th>Qty</th><th>Condition</th><th>Time</th></tr></thead>
                      <tbody>{data.returns.map(r => (
                        <tr key={r._id}>
                          <td className="font-semibold">{r.item?.name}</td>
                          <td>{r.returnedBy?.name}</td>
                          <td>{r.quantityReturned} {r.item?.unit}</td>
                          <td><span className={condBadge(r.condition)}>{r.condition}</span></td>
                          <td className="text-slate-400">{formatDateTime(r.returnDate)}</td>
                        </tr>
                      ))}</tbody>
                    </table></div>
                  ) : <p className="text-sm text-slate-400">No returns on this date</p>}
                </div>
              </div>
            )}

            {/* Monthly */}
            {tab === 'monthly' && data && (
              data.items?.length > 0 ? (
                <div className="tbl-wrap"><table>
                  <thead><tr><th>Item</th><th>Type</th><th>Total Issues</th><th>Total Qty Issued</th><th>Returned</th></tr></thead>
                  <tbody>{data.items.map((item, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{item.name}</td>
                      <td className="capitalize">{item.type}</td>
                      <td>{item.totalIssues}</td>
                      <td>{item.totalQuantity} {item.unit}</td>
                      <td>{item.returnedCount}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              ) : <EmptyState icon={TrendingUp} title="No data" subtitle="No activity for this period" />
            )}

            {/* Low Stock */}
            {tab === 'lowstock' && (
              data?.length > 0 ? (
                <div className="tbl-wrap"><table>
                  <thead><tr><th>Item</th><th>Code</th><th>Type</th><th>Current Qty</th><th>Min. Limit</th><th>Deficit</th><th>Location</th></tr></thead>
                  <tbody>{data.map(item => (
                    <tr key={item._id}>
                      <td className="font-semibold">{item.name}</td>
                      <td className="font-mono text-xs">{item.itemCode}</td>
                      <td className="capitalize">{item.type}</td>
                      <td className="text-red-600 font-bold">{item.quantity} {item.unit}</td>
                      <td>{item.minimumLimit} {item.unit}</td>
                      <td className="text-red-500 font-semibold">-{item.deficit} {item.unit}</td>
                      <td className="text-slate-400">{item.storageLocation||'—'}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              ) : <EmptyState icon={AlertTriangle} title="All stocked up!" subtitle="No items below minimum limit" />
            )}

            {/* Damage */}
            {tab === 'damage' && (
              data?.length > 0 ? (
                <div className="tbl-wrap"><table>
                  <thead><tr><th>Item</th><th>Reported By</th><th>Type</th><th>Qty Affected</th><th>Description</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>{data.map(r => (
                    <tr key={r._id}>
                      <td className="font-semibold">{r.item?.name}</td>
                      <td>{r.reportedBy?.name}</td>
                      <td><span className={condBadge(r.damageType)}>{r.damageType}</span></td>
                      <td>{r.quantityAffected||'—'}</td>
                      <td className="max-w-48 truncate text-slate-500">{r.description}</td>
                      <td><span className={r.actionTaken==='pending'?'badge badge-yellow':'badge badge-green'}>{r.actionTaken}</span></td>
                      <td className="text-slate-400">{formatDateTime(r.reportDate)}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              ) : <EmptyState icon={FileWarning} title="No damage reports" subtitle="No damage has been reported" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
