import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Share2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  X
} from 'lucide-react';
import { Customer, Sale } from '../types';
import { storage } from '../services/storage';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(storage.getCustomers());
  const sales = storage.getSales();
  const settings = storage.getSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<{ customer: Customer; sales: Sale[] } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const initialForm = {
    customer_name: '',
    phone: '',
    email: '',
    address: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      customer_name: c.customer_name,
      phone: c.phone,
      email: c.email,
      address: c.address
    });
    setIsModalOpen(true);
  };

  const handleViewHistory = (c: Customer) => {
    const custSales = sales.filter(s => s.customer_id === c.customer_id);
    setHistoryCustomer({ customer: c, sales: custSales });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      setNotice({ type: 'error', message: 'Customer name is required.' });
      return;
    }

    try {
      if (editingCustomer) {
        storage.updateCustomer(editingCustomer.customer_id, {
          customer_name: formData.customer_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim()
        });
        setNotice({ type: 'success', message: 'Customer details updated!' });
      } else {
        storage.addCustomer({
          customer_name: formData.customer_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim()
        });
        setNotice({ type: 'success', message: 'Customer registered successfully!' });
      }

      setCustomers(storage.getCustomers());
      setIsModalOpen(false);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const res = storage.deleteCustomer(deleteConfirm.customer_id);
    setNotice({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
    setDeleteConfirm(null);
    setCustomers(storage.getCustomers());
  };

  const handleOpenWhatsAppChat = (phone: string, name: string) => {
    const cleanDigits = phone.replace(/\D/g, '');
    let finalPhone = cleanDigits;
    if (finalPhone.length === 10) {
      finalPhone = '91' + finalPhone;
    }
    const text = encodeURIComponent(
      `Hello ${name},\nGreetings from ${settings.pharmacy_name}! Please let us know if you need any medicine refills or clinical assistance. Wishing you good health!`
    );
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  const filtered = customers.filter(c =>
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Customer Directory & Patient Profiles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain customer records, purchase histories, and WhatsApp contact lines for refill reminders.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Customer</span>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number, or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <div className="text-slate-500 font-medium">
          Total Customers: <strong className="text-slate-800">{customers.length}</strong>
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const custSales = sales.filter(s => s.customer_id === c.customer_id);
          const totalSpent = custSales.reduce((sum, s) => sum + s.total_amount, 0);
          const hasPhone = Boolean(c.phone && c.phone.replace(/\D/g, '').length >= 10);

          return (
            <div key={c.customer_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900">{c.customer_name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    {custSales.length} bills
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600 mt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium text-slate-800">{c.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.email || 'No email registered'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 line-clamp-1">{c.address || 'Address not recorded'}</span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Lifetime Spend:</span>
                    <span className="font-bold text-teal-800 text-xs">
                      {settings.currency_symbol}{totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleViewHistory(c)}
                  className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Bills ({custSales.length})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {hasPhone && (
                    <button
                      onClick={() => handleOpenWhatsAppChat(c.phone, c.customer_name)}
                      title="Open WhatsApp Chat"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(c)}
                    title="Edit Customer"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(c)}
                    title="Delete Customer"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
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
                  value={formData.customer_name}
                  onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Amit Patil"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number (for WhatsApp Invoices)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98234 56789"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="amit.patil@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Landmark</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Postal Code..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER PURCHASE HISTORY MODAL */}
      {historyCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Purchase History</h3>
                <span className="text-slate-500">{historyCustomer.customer.customer_name} ({historyCustomer.customer.phone || 'No phone'})</span>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {historyCustomer.sales.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  No purchases recorded yet for this customer.
                </div>
              ) : (
                historyCustomer.sales.map(s => (
                  <div key={s.sale_id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-slate-900">{s.bill_number}</div>
                      <div className="text-[11px] text-slate-400">{s.sale_date} • {s.payment_method}</div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {s.items.map(i => `${i.medicine_name} (${i.quantity})`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-teal-800 text-sm">{settings.currency_symbol}{s.total_amount.toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Completed</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-2">Delete Customer Record</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to remove <strong>"{deleteConfirm.customer_name}"</strong>?
              If this customer has existing bills, relational integrity prevents accidental deletion.
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
