import { useState, useEffect } from 'react';
import { Plus, Search, Shield, UserX, Mail, Building2, MoreVertical, X, Check, Copy } from 'lucide-react';
import { membersAPI } from '../services/api';
import { roleBadge, roleLabel, formatDateTime } from '../utils/helpers';
import { Spinner, Pagination } from '../components/ui';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'STUDENT', department: '' });
  const [inviteLink, setInviteLink] = useState('');

  const fetchMembers = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await membersAPI.getAll({ page, limit: 15, search: searchQuery });
      setMembers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchMembers(1, search), 300);
    return () => clearTimeout(delay);
  }, [search]);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await membersAPI.invite(inviteForm);
      setInviteLink(res.data.data.inviteUrl);
      toast.success('Invite created!');
      fetchMembers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await membersAPI.toggleStatus(id);
      toast.success('Status updated');
      setMembers(members.map(m => m._id === id ? { ...m, isActive: !m.isActive } : m));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const resetPassword = async (id) => {
    const newPassword = prompt('Enter new password (min 6 chars):');
    if (!newPassword) return;
    if (newPassword.length < 6) { toast.error('Password too short'); return; }
    try {
      await membersAPI.resetPassword(id, { newPassword });
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const deleteMember = async (id) => {
    if (!confirm('Are you sure you want to completely remove this member?')) return;
    try {
      await membersAPI.delete(id);
      toast.success('Member removed');
      fetchMembers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Institute Members</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Manage students and lab incharges</p>
        </div>
        <button onClick={() => { setInviteForm({ name: '', email: '', role: 'STUDENT', department: '' }); setInviteLink(''); setShowInviteModal(true); }} 
          className="btn-primary shrink-0">
          <Plus size={16} /> Invite Member
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" className="input pl-10" placeholder="Search by name, email, or department..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
          Total Members: <span style={{ color: 'var(--text-primary)' }}>{pagination.total}</span>
        </div>
      </div>

      {loading ? (
        <div className="card p-10 flex justify-center"><Spinner /></div>
      ) : members.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <UserX size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No members found</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Try adjusting your search</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th className="px-6 py-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Member</th>
                  <th className="px-6 py-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Role</th>
                  <th className="px-6 py-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Department</th>
                  <th className="px-6 py-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="px-6 py-4 font-bold text-right" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                {members.map(member => (
                  <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                          style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))' }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{member.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${roleBadge(member.role)}`}>{roleLabel(member.role)}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {member.department || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {member.isActive ? (
                        <span className="badge badge-green"><Check size={12}/> Active</span>
                      ) : member.inviteToken ? (
                        <span className="badge badge-yellow">Pending Invite</span>
                      ) : (
                        <span className="badge badge-red">Deactivated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'INSTITUTE_ADMIN' && (
                        <div className="relative group inline-block">
                          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                            <MoreVertical size={16} />
                          </button>
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
                            <button onClick={() => toggleStatus(member._id)} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                              {member.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => resetPassword(member._id)} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                              Reset Password
                            </button>
                            <button onClick={() => deleteMember(member._id)} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                              Delete Member
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Pagination page={pagination.page} pages={pagination.pages} onPageChange={p => fetchMembers(p)} />
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Invite Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-6">
              {!inviteLink ? (
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input" required value={inviteForm.name} onChange={e => setInviteForm({...inviteForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" className="input" required value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Role</label>
                      <select className="input" value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})}>
                        <option value="STUDENT">Student</option>
                        <option value="LAB_INCHARGE">Lab Incharge</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Department</label>
                      <input className="input" value={inviteForm.department} onChange={e => setInviteForm({...inviteForm, department: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3 justify-center mt-4">Generate Invite Link</button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400"><Check size={32} /></div>
                  <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Invite Link Generated</h4>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Send this link to the user so they can set their password.</p>
                  
                  <div className="flex items-center gap-2 mt-4 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <input type="text" readOnly value={inviteLink} className="flex-1 bg-transparent text-xs p-2 outline-none text-slate-600 dark:text-slate-300" />
                    <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Copied!'); }} className="p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                  
                  <button onClick={() => setShowInviteModal(false)} className="w-full py-3 mt-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
