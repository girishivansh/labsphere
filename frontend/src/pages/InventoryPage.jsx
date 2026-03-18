import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, QrCode, AlertTriangle, Package } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Modal, PageHeader, EmptyState, LoadingPage, ConfirmDialog, Pagination } from '../components/ui';
import { hazardBadge, formatDate, isLowStock } from '../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const UNITS    = ['g','mg','kg','ml','L','pieces','boxes','bottles'];
const HAZARDS  = ['low','medium','high','extreme'];
const DEF_FORM = { name:'', type:'chemical', quantity:'', unit:'ml', minimumLimit:'', storageLocation:'', description:'', supplier:'', casNumber:'', hazardLevel:'low' };

export default function InventoryPage() {
  const { isAdmin, isTeacher } = useAuth();
  const canModify = isAdmin || isTeacher;

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

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Manage chemicals and equipment"
        action={canModify && <button onClick={openAdd} className="btn-primary"><Plus size={16}/>Add Item</button>} />

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-8" placeholder="Search items..." value={filters.search} onChange={e => F('search', e.target.value)} />
        </div>
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

      {/* Table */}
      <div className="card">
        {loading ? <LoadingPage /> : items.length === 0 ? (
          <EmptyState icon={Package} title="No items found" subtitle="Add items or change filters" />
        ) : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>Item</th><th>Type</th><th>Quantity</th><th>Min. Limit</th>
                  <th>Location</th><th>Hazard</th><th>Added</th>
                  {canModify && <th>Actions</th>}
                </tr></thead>
                <tbody>
                  {items.map(item => {
                    const low = isLowStock(item);
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'chemical' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              <Package size={14} />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                {item.name}
                                {low && <AlertTriangle size={12} className="text-amber-500" />}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">{item.itemCode}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={item.type === 'chemical' ? 'badge badge-purple' : 'badge badge-blue'}>{item.type}</span></td>
                        <td><span className={`font-semibold ${low ? 'text-red-600' : 'text-slate-700'}`}>{item.quantity} {item.unit}</span></td>
                        <td className="text-slate-500">{item.minimumLimit} {item.unit}</td>
                        <td className="text-slate-500">{item.storageLocation || '—'}</td>
                        <td><span className={hazardBadge(item.hazardLevel)}>{item.hazardLevel}</span></td>
                        <td className="text-slate-400">{formatDate(item.createdAt)}</td>
                        {canModify && (
                          <td>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setQrItem(item)} className="btn-ghost rounded-lg p-1.5" title="QR Code"><QrCode size={15}/></button>
                              <button onClick={() => openEdit(item)} className="btn-ghost rounded-lg p-1.5" title="Edit"><Edit2 size={15}/></button>
                              {isAdmin && <button onClick={() => setDeleteItem(item)} className="btn-ghost rounded-lg p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={15}/></button>}
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
          <div className="text-center space-y-3">
            <div className="inline-block p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <QRCodeSVG value={JSON.stringify({ id:qrItem._id, code:qrItem.itemCode, name:qrItem.name })} size={180} />
            </div>
            <p className="font-bold text-slate-800">{qrItem.name}</p>
            <p className="text-xs text-slate-400 font-mono">{qrItem.itemCode}</p>
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
