import { useEffect, useState } from 'react';
import { FileBarChart, AlertTriangle, FileWarning, Calendar, TrendingUp, Download } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { PageHeader, LoadingPage, EmptyState, TabBar, SkeletonTable } from '../components/ui';
import { formatDateTime, condBadge, exportToCSV, CHART_COLORS } from '../utils/helpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

  const handleExport = () => {
    if (tab === 'daily' && data) {
      const issues = data.issues || [];
      const returns = data.returns || [];
      if (issues.length > 0) {
        exportToCSV(issues, [
          { label: 'Item', accessor: r => r.item?.name },
          { label: 'Issued To', accessor: r => r.issuedTo?.name },
          { label: 'Quantity', accessor: 'quantity' },
          { label: 'Purpose', accessor: 'purpose' },
        ], `daily_issues_${date}`);
      }
      if (returns.length > 0) {
        exportToCSV(returns, [
          { label: 'Item', accessor: r => r.item?.name },
          { label: 'Returned By', accessor: r => r.returnedBy?.name },
          { label: 'Quantity', accessor: 'quantityReturned' },
          { label: 'Condition', accessor: 'condition' },
        ], `daily_returns_${date}`);
      }
    } else if (tab === 'monthly' && data?.items?.length > 0) {
      exportToCSV(data.items, [
        { label: 'Item', accessor: 'name' },
        { label: 'Type', accessor: 'type' },
        { label: 'Total Issues', accessor: 'totalIssues' },
        { label: 'Total Qty', accessor: 'totalQuantity' },
        { label: 'Returned', accessor: 'returnedCount' },
      ], `monthly_report_${year}_${month}`);
    } else if (tab === 'lowstock' && data?.length > 0) {
      exportToCSV(data, [
        { label: 'Item', accessor: 'name' },
        { label: 'Code', accessor: 'itemCode' },
        { label: 'Current Qty', accessor: 'quantity' },
        { label: 'Min Limit', accessor: 'minimumLimit' },
        { label: 'Deficit', accessor: 'deficit' },
      ], 'low_stock_report');
    }
  };

  // Monthly chart data
  const monthlyChartData = tab === 'monthly' && data?.items ? {
    labels: data.items.slice(0, 10).map(i => i.name.length > 15 ? i.name.slice(0, 15) + '...' : i.name),
    datasets: [{
      label: 'Total Qty Issued',
      data: data.items.slice(0, 10).map(i => i.totalQuantity),
      backgroundColor: CHART_COLORS.blue.bg,
      borderColor: CHART_COLORS.blue.border,
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: 'var(--text-tertiary)' } },
      y: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter', size: 11, weight: '600' }, color: 'var(--text-secondary)' } },
    }
  };

  const hasExportableData = (tab === 'daily' && data && ((data.issues?.length > 0) || (data.returns?.length > 0))) ||
    (tab === 'monthly' && data?.items?.length > 0) || (tab === 'lowstock' && data?.length > 0);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" subtitle="Analytics and audit trail"
        action={hasExportableData && (
          <button onClick={handleExport} className="btn-secondary">
            <Download size={15} /> Export CSV
          </button>
        )} />

      {/* Tabs */}
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* Filters */}
      {tab === 'daily' && (
        <div className="card p-4 mb-5 flex items-center gap-3">
          <label className="label mb-0 whitespace-nowrap">Select Date:</label>
          <input type="date" className="input w-auto" value={date} max={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} />
          <div className="flex-1" />
          <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      )}
      {tab === 'monthly' && (
        <div className="card p-4 mb-5 flex items-center gap-3 flex-wrap">
          <label className="label mb-0">Month:</label>
          <select className="input w-auto" value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{new Date(2000,m-1).toLocaleString('default',{month:'long'})}</option>)}
          </select>
          <select className="input w-auto" value={year} onChange={e => setYear(e.target.value)}>
            {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      <div className="card">
        {loading ? <SkeletonTable rows={6} cols={5} /> : (
          <>
            {/* Daily */}
            {tab === 'daily' && data && (
              <div className="p-5 space-y-6">
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"/>Issues ({data.issues?.length || 0})
                  </h3>
                  {data.issues?.length > 0 ? (
                    <div className="tbl-wrap"><table>
                      <thead><tr><th>Item</th><th>Issued To</th><th>Qty</th><th>Purpose</th><th>Time</th></tr></thead>
                      <tbody>{data.issues.map(i => (
                        <tr key={i._id}>
                          <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{i.item?.name}</td>
                          <td>{i.issuedTo?.name}</td>
                          <td className="font-semibold">{i.quantity} {i.item?.unit}</td>
                          <td style={{ color: 'var(--text-tertiary)' }}>{i.purpose||'—'}</td>
                          <td style={{ color: 'var(--text-tertiary)' }}>{formatDateTime(i.issueDate)}</td>
                        </tr>
                      ))}</tbody>
                    </table></div>
                  ) : <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No issues on this date</p>}
                </div>
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"/>Returns ({data.returns?.length || 0})
                  </h3>
                  {data.returns?.length > 0 ? (
                    <div className="tbl-wrap"><table>
                      <thead><tr><th>Item</th><th>Returned By</th><th>Qty</th><th>Condition</th><th>Time</th></tr></thead>
                      <tbody>{data.returns.map(r => (
                        <tr key={r._id}>
                          <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{r.item?.name}</td>
                          <td>{r.returnedBy?.name}</td>
                          <td className="font-semibold">{r.quantityReturned} {r.item?.unit}</td>
                          <td><span className={condBadge(r.condition)}>{r.condition}</span></td>
                          <td style={{ color: 'var(--text-tertiary)' }}>{formatDateTime(r.returnDate)}</td>
                        </tr>
                      ))}</tbody>
                    </table></div>
                  ) : <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No returns on this date</p>}
                </div>
              </div>
            )}

            {/* Monthly */}
            {tab === 'monthly' && data && (
              data.items?.length > 0 ? (
                <div className="p-5 space-y-6">
                  {/* Chart */}
                  {monthlyChartData && (
                    <div style={{ height: `${Math.max(200, data.items.slice(0,10).length * 40)}px` }}>
                      <Bar data={monthlyChartData} options={chartOptions} />
                    </div>
                  )}
                  {/* Table */}
                  <div className="tbl-wrap"><table>
                    <thead><tr><th>Item</th><th>Type</th><th>Total Issues</th><th>Total Qty Issued</th><th>Returned</th></tr></thead>
                    <tbody>{data.items.map((item, i) => (
                      <tr key={i}>
                        <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                        <td className="capitalize">{item.type}</td>
                        <td className="font-semibold">{item.totalIssues}</td>
                        <td className="font-semibold">{item.totalQuantity} {item.unit}</td>
                        <td>{item.returnedCount}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              ) : <EmptyState icon={TrendingUp} title="No data" subtitle="No activity for this period" />
            )}

            {/* Low Stock */}
            {tab === 'lowstock' && (
              data?.length > 0 ? (
                <div className="tbl-wrap"><table>
                  <thead><tr><th>Item</th><th>Code</th><th>Type</th><th>Current Qty</th><th>Min. Limit</th><th>Deficit</th><th>Location</th></tr></thead>
                  <tbody>{data.map(item => (
                    <tr key={item._id}>
                      <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                      <td className="font-mono text-xs">{item.itemCode}</td>
                      <td className="capitalize">{item.type}</td>
                      <td className="text-red-500 font-bold">{item.quantity} {item.unit}</td>
                      <td>{item.minimumLimit} {item.unit}</td>
                      <td className="text-red-500 font-bold">-{item.deficit} {item.unit}</td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{item.storageLocation||'—'}</td>
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
                      <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{r.item?.name}</td>
                      <td>{r.reportedBy?.name}</td>
                      <td><span className={condBadge(r.damageType)}>{r.damageType}</span></td>
                      <td className="font-semibold">{r.quantityAffected||'—'}</td>
                      <td className="max-w-48 truncate" style={{ color: 'var(--text-tertiary)' }}>{r.description}</td>
                      <td><span className={r.actionTaken==='pending'?'badge badge-yellow':'badge badge-green'}>{r.actionTaken}</span></td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{formatDateTime(r.reportDate)}</td>
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
