import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, UserX, Users, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { usersAPI } from '../services/api';
import { Modal, PageHeader, EmptyState, LoadingPage, ConfirmDialog } from '../components/ui';
import { formatDate, roleBadge } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const DEF_FORM = { name:'', email:'', password:'', confirmPassword:'', role:'student', department:'', phone:'' };

// Password strength checker
const checkStrength = (pass) => {
  const checks = {
    length:  pass.length >= 8,
    upper:   /[A-Z]/.test(pass),
    lower:   /[a-z]/.test(pass),
    number:  /[0-9]/.test(pass),
    special: /[!@#$%^&*()_+\-=\[\]{};':",.<>?]/.test(pass),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser,  setEditUser]  = useState(null);
  const [deactUser, setDeactUser] = useState(null);
  const [form,      setForm]      = useState(DEF_FORM);
  const [saving,    setSaving]    = useState(false);
  const [deacting,  setDeacting]  = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    usersAPI.getAll()
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => {
    setEditUser(null);
    setForm(DEF_FORM);
    setShowPass(false);
    setShowConf(false);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name:u.name, email:u.email, password:'', confirmPassword:'', role:u.role, department:u.department||'', phone:u.phone||'' });
    setShowPass(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Password validation for new user
    if (!editUser) {
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match!');
        setSaving(false);
        return;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setSaving(false);
        return;
      }
    }

    try {
      if (editUser) {
        const { password, confirmPassword, email, ...upd } = form;
        await usersAPI.update(editUser._id, { ...upd, isActive: true });
        toast.success('User updated successfully');
      } else {
        const { confirmPassword, ...userData } = form;
        await usersAPI.create(userData);
        toast.success(`User created! Password: ${form.password}`);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeacting(true);
    try {
      await usersAPI.delete(deactUser._id);
      toast.success('User deactivated');
      setDeactUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setDeacting(false);
    }
  };

  const { checks, score } = checkStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][score];

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage system users and roles"
        action={<button onClick={openAdd} className="btn-primary"><Plus size={16}/>Add User</button>} />

      <div className="card">
        {loading ? <LoadingPage /> : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Department</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {u.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500">{u.email}</td>
                    <td><span className={roleBadge(u.role)}>{u.role}</span></td>
                    <td className="text-slate-500">{u.department || '—'}</td>
                    <td>
                      <span className={u.isActive ? 'badge badge-green' : 'badge badge-gray'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-slate-400">{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)} className="btn-ghost rounded-lg p-1.5" title="Edit">
                          <Edit2 size={15}/>
                        </button>
                        {u._id !== me?._id && u.isActive && (
                          <button onClick={() => setDeactUser(u)}
                            className="btn-ghost rounded-lg p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
                            title="Deactivate">
                            <UserX size={15}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editUser ? 'Edit User' : 'Add New User'}>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="label">Full Name *</label>
            <input className="input" placeholder="e.g. Rahul Kumar"
              value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input type="email" className="input" placeholder="user@example.com"
              value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              required disabled={!!editUser} />
            {editUser && <p className="text-xs text-slate-400 mt-1">Email cannot be changed after creation</p>}
          </div>

          {/* Password — only for new user */}
          {!editUser && (
            <>
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({...p, password: e.target.value}))}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>

                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? strengthColor : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${['','text-red-500','text-orange-500','text-yellow-600','text-blue-600','text-green-600'][score]}`}>
                      {strengthLabel}
                    </p>
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { key:'length',  label:'Min. 8 characters' },
                        { key:'upper',   label:'Uppercase letter' },
                        { key:'lower',   label:'Lowercase letter' },
                        { key:'number',  label:'Number' },
                        { key:'special', label:'Special character' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1.5">
                          {checks[key]
                            ? <CheckCircle size={12} className="text-green-500 flex-shrink-0"/>
                            : <XCircle    size={12} className="text-slate-300 flex-shrink-0"/>}
                          <span className={`text-xs ${checks[key] ? 'text-green-600' : 'text-slate-400'}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConf ? 'text' : 'password'}
                    className={`input pr-10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 focus:border-red-400' : ''}`}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({...p, confirmPassword: e.target.value}))}
                    required
                  />
                  <button type="button" onClick={() => setShowConf(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConf ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12}/> Passwords do not match
                  </p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 6 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={12}/> Passwords match
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="label">Role *</label>
            <select className="input" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}>
              <option value="student">Student</option>
              <option value="teacher">Teacher / Lab In-charge</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="label">Department</label>
            <input className="input" placeholder="e.g. Chemistry"
              value={form.department} onChange={e => setForm(p => ({...p, department: e.target.value}))} />
          </div>

          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+91 XXXXX XXXXX"
              value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving ||
              (!editUser && form.password !== form.confirmPassword) ||
              (!editUser && form.password.length < 6)}
              className="btn-primary disabled:opacity-40">
              {saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirm */}
      <ConfirmDialog
        isOpen={!!deactUser} onClose={() => setDeactUser(null)}
        onConfirm={handleDeactivate} title="Deactivate User"
        confirmText="Deactivate" loading={deacting}
        message={`Deactivate "${deactUser?.name}"? They won't be able to login.`}
      />
    </div>
  );
}
