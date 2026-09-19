import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Key,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface UsersViewProps {
  currentUser: User | null;
  onRefreshUsers: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ currentUser, onRefreshUsers }) => {
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const initialForm = {
    username: '',
    password: '',
    role: 'Staff' as UserRole,
    full_name: '',
    email: '',
    status: 'Active' as 'Active' | 'Inactive'
  };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      password: u.password || u.password_hash || '',
      role: u.role,
      full_name: u.full_name,
      email: u.email || '',
      status: u.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.full_name.trim()) {
      setNotice({ type: 'error', message: 'Username and Full Name are required.' });
      return;
    }

    try {
      if (editingUser) {
        storage.updateUser(editingUser.user_id, {
          username: formData.username.trim(),
          password: formData.password || editingUser.password,
          role: formData.role,
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          status: formData.status
        });
        setNotice({ type: 'success', message: 'User credentials and role updated!' });
      } else {
        storage.addUser({
          username: formData.username.trim(),
          password: formData.password || 'password123',
          role: formData.role,
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          status: formData.status
        });
        setNotice({ type: 'success', message: 'New system user registered!' });
      }

      setUsers(storage.getUsers());
      setIsModalOpen(false);
      onRefreshUsers();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.user_id === currentUser?.user_id) {
      setNotice({ type: 'error', message: 'You cannot delete your currently active session account.' });
      setDeleteConfirm(null);
      return;
    }
    const res = storage.deleteUser(deleteConfirm.user_id);
    setNotice({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
    setDeleteConfirm(null);
    setUsers(storage.getUsers());
    onRefreshUsers();
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Staff Accounts & Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmacy personnel privileges across Admin, Pharmacist, and Staff roles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          notice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Role Definitions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span>Role: Admin</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Full system control: Inventory, Purchases, Sales, User management, Settings, and DBMS tools.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>Role: Pharmacist</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Clinical management: Medicine CRUD, Suppliers, Inward Purchases, POS Billing, and AI Demand forecasts.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Role: Staff / Cashier</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Operational counter: Fast POS billing, Customer registration, and stock availability lookup.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(u => (
                <tr key={u.user_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{u.full_name}</div>
                    {u.user_id === currentUser?.user_id && (
                      <span className="text-[10px] text-teal-600 font-bold">(Current Active Login)</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                    @{u.username}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      u.role === 'Admin' ? 'bg-teal-100 text-teal-800' :
                      u.role === 'Pharmacist' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {u.email}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                      u.status === 'Active' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {u.created_at}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        title="Delete User"
                        disabled={u.user_id === currentUser?.user_id}
                        className={`p-1.5 rounded-lg transition ${
                          u.user_id === currentUser?.user_id
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {editingUser ? 'Edit User Credentials' : 'Add New Pharmacy Staff User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Saurabh Alone"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. saurabh"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-semibold"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Leave blank to retain password' : 'Enter login password'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@pharmacy.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-2">Delete User Account</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to remove user <strong>"@{deleteConfirm.username}"</strong> ({deleteConfirm.full_name})?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
