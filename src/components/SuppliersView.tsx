import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Supplier } from '../types';
import { storage } from '../services/storage';

export const SuppliersView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(storage.getSuppliers());
  const medicines = storage.getMedicines();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Supplier | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const initialForm = {
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    gst_number: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      supplier_name: s.supplier_name,
      contact_person: s.contact_person,
      phone: s.phone,
      email: s.email,
      address: s.address,
      gst_number: s.gst_number || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_name.trim()) {
      setNotice({ type: 'error', message: 'Supplier company name is required.' });
      return;
    }

    try {
      if (editingSupplier) {
        storage.updateSupplier(editingSupplier.supplier_id, {
          supplier_name: formData.supplier_name.trim(),
          contact_person: formData.contact_person.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          gst_number: formData.gst_number.trim()
        });
        setNotice({ type: 'success', message: 'Supplier details updated!' });
      } else {
        storage.addSupplier({
          supplier_name: formData.supplier_name.trim(),
          contact_person: formData.contact_person.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          gst_number: formData.gst_number.trim(),
          status: 'Active'
        });
        setNotice({ type: 'success', message: 'Supplier registered into pharmacy database!' });
      }

      setSuppliers(storage.getSuppliers());
      setIsModalOpen(false);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const res = storage.deleteSupplier(deleteConfirm.supplier_id);
    setNotice({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
    setDeleteConfirm(null);
    setSuppliers(storage.getSuppliers());
  };

  const filtered = suppliers.filter(s =>
    s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery) ||
    (s.gst_number && s.gst_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            <span>Pharmaceutical Suppliers & Wholesalers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered distributors, manufacturers, contact representatives, and GST compliance records.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
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
            placeholder="Search by supplier name, contact person, phone, or GSTIN..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <div className="text-slate-500 font-medium">
          Total Registered: <strong className="text-slate-800">{suppliers.length}</strong>
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => {
          const suppliedCount = medicines.filter(m => m.supplier_id === s.supplier_id).length;

          return (
            <div key={s.supplier_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900">{s.supplier_name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {suppliedCount} medicines supplied
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Contact:</span>
                    <span>{s.contact_person}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-500">GST: {s.gst_number || 'Unregistered'}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 line-clamp-2">{s.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirm(s)}
                  className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {editingSupplier ? 'Edit Supplier Record' : 'Register New Pharmaceutical Supplier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supplier / Agency Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier_name}
                  onChange={e => setFormData({ ...formData, supplier_name: e.target.value })}
                  placeholder="e.g. Apex Pharma Distributors"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Rajesh Patil"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98220 12345"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@apexpharma.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gst_number}
                    onChange={e => setFormData({ ...formData, gst_number: e.target.value })}
                    placeholder="27AABCU9603R1ZM"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse / Depot Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Industrial Area, City..."
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
                  Save Supplier
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
            <h3 className="font-bold text-base text-slate-900 mb-2">Delete Supplier Record</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to remove <strong>"{deleteConfirm.supplier_name}"</strong>?
              If any medicines or purchase orders reference this supplier, MySQL foreign key restrictions will prevent accidental data corruption.
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
