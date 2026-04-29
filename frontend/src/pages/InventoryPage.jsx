import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, QrCode, AlertTriangle, Package, Grid3X3, List, Download, FlaskConical, Wrench } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Modal, PageHeader, EmptyState, LoadingPage, ConfirmDialog, Pagination, SearchInput, SkeletonTable } from '../components/ui';
import { hazardBadge, formatDate, isLowStock, stockPercent } from '../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const UNITS    = ['g','mg','kg','ml','L','pieces','boxes','bottles'];
const HAZARDS  = ['low','medium','high','extreme'];
const DEF_FORM = { name:'', type:'chemical', quantity:'', unit:'ml', minimumLimit:'', storageLocation:'', description:'', supplier:'', casNumber:'', hazardLevel:'low' };

export default function InventoryPage() {
  const { isInstituteAdmin, isLabIncharge } = useAuth();
  const canModify = isInstituteAdmin || isLabIncharge;

  const [items,      setItems]      = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({ page:1, limit:15, search:'', type:'', low_stock:'' });
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [qrItem,     setQrItem]     = useState(null);
  const [form,       setForm]       = useState(DEF_FORM);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [viewMode,   setViewMode]   = useState('table'); // 'table' or 'grid'

  // Check URL params for low_stock filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('low_stock') === 'true') {
      setFilters(p => ({ ...p, low_stock: 'true' }));
    }
  }, []);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    if (!params.type)      delete params.type;
    if (!params.low_stock) delete params.low_stock;
    if (!params.search)    delete params.search;
    itemsAPI.getAll(params)
      .then(res => { setItems(res.data.data); setPagination(res.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditItem(null); setForm(DEF_FORM); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name:item.name, type:item.type, quantity:item.quantity, unit:item.unit,
      minimumLimit:item.minimumLimit, storageLocation:item.storageLocation||'',
      description:item.description||'', supplier:item.supplier||'',
      casNumber:item.casNumber||'', hazardLevel:item.hazardLevel||'low' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) { await itemsAPI.update(editItem._id, form); toast.success('Item updated'); }
      else          { await itemsAPI.create(form);               toast.success('Item added'); }
      setModalOpen(false);
      fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await itemsAPI.delete(deleteItem._id);
      toast.success('Item deleted');
      setDeleteItem(null);
      fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const F = (k, v) => setFilters(p => ({ ...p, [k]: v, page: 1 }));

  const hazardColors = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
    extreme: 'bg-violet-500',
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Inventory" subtitle={`${pagination?.total || 0} items in your lab`}
        action={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button onClick={() => setViewMode('table')} className={`p-2.5 transition-all ${viewMode === 'table' ? 'bg-brand-600 text-white' : 'btn-ghost'}`} title="Table view"><List size={16} /></button>
              <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'btn-ghost'}`} title="Grid view"><Grid3X3 size={16} /></button>
            </div>
            {canModify && <button onClick={openAdd} className="btn-primary"><Plus size={16}/>Add Item</button>}
          </div>
        } />

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <SearchInput value={filters.search} onChange={v => F('search', v)} placeholder="Search items, codes, locations..." />
        <select className="input w-auto" value={filters.type} onChange={e => F('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="chemical">Chemical</option>
          <option value="equipment">Equipment</option>
        </select>
        <select className="input w-auto" value={filters.low_stock} onChange={e => F('low_stock', e.target.value)}>
          <option value="">All Stock</option>
          <option value="true">Low Stock Only</option>
        </select>
      </div>

      {/* Content */}
      <div className="card">
        {loading ? <SkeletonTable rows={8} cols={7} /> : items.length === 0 ? (
          <EmptyState icon={Package} title="No items found" subtitle="Add items or change filters" action={canModify && <button onClick={openAdd} className="btn-primary"><Plus size={16}/>Add Item</button>} />
        ) : viewMode === 'table' ? (
          <>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>Item</th><th>Type</th><th>Stock</th><th>Min. Limit</th>
                  <th>Location</th><th>Hazard</th><th>Added</th>
                  {canModify && <th>Actions</th>}
                </tr></thead>
                <tbody>
                  {items.map(item => {
                    const low = isLowStock(item);
                    const pct = stockPercent(item);
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'chemical' ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400'}`}>
                              {item.type === 'chemical' ? <FlaskConical size={16} /> : <Wrench size={16} />}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                {item.name}
                                {low && <AlertTriangle size={12} className="text-amber-500 animate-pulse-slow" />}
                              </div>
                              <div className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{item.itemCode}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={item.type === 'chemical' ? 'badge badge-purple' : 'badge badge-blue'}>{item.type}</span></td>
                        <td>
                          <div className="space-y-1.5">
                            <span className={`font-bold ${low ? 'text-red-500' : ''}`} style={low ? {} : { color: 'var(--text-primary)' }}>{item.quantity} {item.unit}</span>
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                              <div className={`h-full rounded-full transition-all ${low ? 'bg-red-500' : pct > 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>{item.minimumLimit} {item.unit}</td>
                        <td>{item.storageLocation || '—'}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${hazardColors[item.hazardLevel]}`} />
                            <span className={hazardBadge(item.hazardLevel)}>{item.hazardLevel}</span>
                          </div>
                        </td>
                        <td>{formatDate(item.createdAt)}</td>
                        {canModify && (
                          <td>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setQrItem(item)} className="btn-ghost rounded-xl p-2" title="QR Code"><QrCode size={15}/></button>
                              <button onClick={() => openEdit(item)} className="btn-ghost rounded-xl p-2" title="Edit"><Edit2 size={15}/></button>
                              {isInstituteAdmin && <button onClick={() => setDeleteItem(item)} className="btn-ghost rounded-xl p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete"><Trash2 size={15}/></button>}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3">
              <Pagination pagination={pagination} onPageChange={p => setFilters(prev => ({ ...prev, page: p }))} />
            </div>
          </>
        ) : (
          /* Grid View */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {items.map(item => {
                const low = isLowStock(item);
                const pct = stockPercent(item);
                return (
                  <div key={item._id} className="rounded-2xl p-4 hover-lift transition-all" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.type === 'chemical' ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400'}`}>
                        {item.type === 'chemical' ? <FlaskConical size={20} /> : <Wrench size={20} />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${hazardColors[item.hazardLevel]}`} />
                        <span className={hazardBadge(item.hazardLevel)}>{item.hazardLevel}</span>
                      </div>
                    </div>
                    <h3 className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                      {low && <AlertTriangle size={12} className="text-amber-500" />}
                    </h3>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.itemCode}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-lg font-extrabold ${low ? 'text-red-500' : ''}`} style={low ? {} : { color: 'var(--text-primary)' }}>{item.quantity} <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{item.unit}</span></span>
                    </div>
                    <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className={`h-full rounded-full ${low ? 'bg-red-500' : pct > 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Min: {item.minimumLimit} {item.unit} · {item.storageLocation || 'No location'}</p>
                    {canModify && (
                      <div className="flex items-center gap-1 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                        <button onClick={() => setQrItem(item)} className="btn-ghost rounded-xl p-2 flex-1 justify-center" title="QR"><QrCode size={14}/></button>
                        <button onClick={() => openEdit(item)} className="btn-ghost rounded-xl p-2 flex-1 justify-center" title="Edit"><Edit2 size={14}/></button>
                        {isInstituteAdmin && <button onClick={() => setDeleteItem(item)} className="btn-ghost rounded-xl p-2 flex-1 justify-center text-red-400 hover:text-red-600" title="Delete"><Trash2 size={14}/></button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3">
              <Pagination pagination={pagination} onPageChange={p => setFilters(prev => ({ ...prev, page: p }))} />
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Item' : 'Add New Item'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Item Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Type *</label>
            <select className="input" value={form.type} onChange={e => setForm(p => ({...p, type:e.target.value}))} disabled={!!editItem}>
              <option value="chemical">Chemical</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          <div>
            <label className="label">Hazard Level</label>
            <select className="input" value={form.hazardLevel} onChange={e => setForm(p => ({...p, hazardLevel:e.target.value}))}>
              {HAZARDS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity *</label>
            <input type="number" min="0" step="0.01" className="input" value={form.quantity} onChange={e => setForm(p => ({...p, quantity:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Unit *</label>
            <select className="input" value={form.unit} onChange={e => setForm(p => ({...p, unit:e.target.value}))}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Minimum Limit</label>
            <input type="number" min="0" step="0.01" className="input" value={form.minimumLimit} onChange={e => setForm(p => ({...p, minimumLimit:e.target.value}))} />
          </div>
          <div>
            <label className="label">Storage Location</label>
            <input className="input" placeholder="e.g. Cabinet A-1" value={form.storageLocation} onChange={e => setForm(p => ({...p, storageLocation:e.target.value}))} />
          </div>
          {form.type === 'chemical' && (
            <div>
              <label className="label">CAS Number</label>
              <input className="input font-mono" placeholder="e.g. 7647-01-0" value={form.casNumber} onChange={e => setForm(p => ({...p, casNumber:e.target.value}))} />
            </div>
          )}
          <div>
            <label className="label">Supplier</label>
            <input className="input" value={form.supplier} onChange={e => setForm(p => ({...p, supplier:e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} />
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}</button>
          </div>
        </form>
      </Modal>

      {/* QR Modal */}
      <Modal isOpen={!!qrItem} onClose={() => setQrItem(null)} title="Item QR Code" size="sm">
        {qrItem && (
          <div className="text-center space-y-4">
            <div className="inline-block p-6 rounded-2xl shadow-sm" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
              <QRCodeSVG value={JSON.stringify({ id:qrItem._id, code:qrItem.itemCode, name:qrItem.name })} size={200} />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{qrItem.name}</p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>{qrItem.itemCode}</p>
            </div>
            <button
              onClick={() => {
                const svg = document.querySelector('.qr-modal-content svg');
                // Simple print approach
                const win = window.open('', '_blank');
                win.document.write(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:Inter,sans-serif"><h2>${qrItem.name}</h2><p>${qrItem.itemCode}</p></body></html>`);
                win.print();
              }}
              className="btn-secondary">
              <Download size={15} /> Print QR Code
            </button>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Delete Item" loading={deleting}
        message={`Delete "${deleteItem?.name}"? This cannot be undone.`} />
    </div>
  );
}
