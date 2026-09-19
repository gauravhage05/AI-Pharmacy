import React, { useState, useMemo } from 'react';
import {
  Pill,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Medicine, Category, Supplier } from '../types';
import { storage } from '../services/storage';

interface MedicinesViewProps {
  onRefreshStats: () => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({ onRefreshStats }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(storage.getMedicines());
  const categories = storage.getCategories();
  const suppliers = storage.getSuppliers();
  const settings = storage.getSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'selling_price' | 'expiry_date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);
  const [deleteConfirmMed, setDeleteConfirmMed] = useState<Medicine | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const initialFormState = {
    medicine_name: '',
    generic_name: '',
    category_id: categories[0]?.category_id || 1,
    manufacturer: '',
    batch_no: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    reorder_level: '25',
    expiry_date: '',
    supplier_id: suppliers[0]?.supplier_id || 1,
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  };

  const [formData, setFormData] = useState(initialFormState);

  const refreshList = () => {
    setMedicines(storage.getMedicines());
    onRefreshStats();
  };

  // Filter & Search
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter(med => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          med.medicine_name.toLowerCase().includes(query) ||
          med.generic_name.toLowerCase().includes(query) ||
          med.batch_no.toLowerCase().includes(query) ||
          (med.category_name && med.category_name.toLowerCase().includes(query));

        const matchesCategory =
          selectedCategory === 'all' || med.category_id === Number(selectedCategory);

        const matchesSupplier =
          selectedSupplier === 'all' || med.supplier_id === Number(selectedSupplier);

        const matchesStatus =
          selectedStatus === 'all' || med.status === selectedStatus;

        return matchesQuery && matchesCategory && matchesSupplier && matchesStatus;
      })
      .sort((a, b) => {
        let valA: string | number = a.medicine_name;
        let valB: string | number = b.medicine_name;
        if (sortBy === 'quantity') {
          valA = a.quantity;
          valB = b.quantity;
        } else if (sortBy === 'selling_price') {
          valA = a.selling_price;
          valB = b.selling_price;
        } else if (sortBy === 'expiry_date') {
          valA = a.expiry_date;
          valB = b.expiry_date;
        }

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        } else {
          return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
        }
      });
  }, [medicines, searchQuery, selectedCategory, selectedSupplier, selectedStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormData({
      ...initialFormState,
      category_id: categories[0]?.category_id || 1,
      supplier_id: suppliers[0]?.supplier_id || 1
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({
      medicine_name: med.medicine_name,
      generic_name: med.generic_name,
      category_id: med.category_id,
      manufacturer: med.manufacturer,
      batch_no: med.batch_no,
      purchase_price: String(med.purchase_price),
      selling_price: String(med.selling_price),
      quantity: String(med.quantity),
      reorder_level: String(med.reorder_level),
      expiry_date: med.expiry_date,
      supplier_id: med.supplier_id,
      description: med.description,
      status: med.status
    });
    setIsAddEditOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.medicine_name.trim()) {
      setNotification({ type: 'error', message: 'Medicine name cannot be empty.' });
      return;
    }
    const pPrice = parseFloat(formData.purchase_price);
    const sPrice = parseFloat(formData.selling_price);
    const qty = parseInt(formData.quantity);
    const reorder = parseInt(formData.reorder_level);

    if (isNaN(pPrice) || pPrice < 0) {
      setNotification({ type: 'error', message: 'Purchase price must be a non-negative number.' });
      return;
    }
    if (isNaN(sPrice) || sPrice < 0) {
      setNotification({ type: 'error', message: 'Selling price must be a non-negative number.' });
      return;
    }
    if (isNaN(qty) || qty < 0) {
      setNotification({ type: 'error', message: 'Quantity cannot be negative.' });
      return;
    }
    if (!formData.expiry_date) {
      setNotification({ type: 'error', message: 'Please provide a valid expiry date.' });
      return;
    }

    try {
      if (editingMedicine) {
        storage.updateMedicine(editingMedicine.medicine_id, {
          medicine_name: formData.medicine_name.trim(),
          generic_name: formData.generic_name.trim(),
          category_id: Number(formData.category_id),
          manufacturer: formData.manufacturer.trim(),
          batch_no: formData.batch_no.trim(),
          purchase_price: pPrice,
          selling_price: sPrice,
          quantity: qty,
          reorder_level: isNaN(reorder) ? 20 : reorder,
          expiry_date: formData.expiry_date,
          supplier_id: Number(formData.supplier_id),
          description: formData.description.trim(),
          status: formData.status
        });
        setNotification({ type: 'success', message: 'Medicine updated successfully in MySQL database!' });
      } else {
        storage.addMedicine({
          medicine_name: formData.medicine_name.trim(),
          generic_name: formData.generic_name.trim(),
          category_id: Number(formData.category_id),
          manufacturer: formData.manufacturer.trim(),
          batch_no: formData.batch_no.trim() || `BAT-${Date.now().toString().slice(-5)}`,
          purchase_price: pPrice,
          selling_price: sPrice,
          quantity: qty,
          reorder_level: isNaN(reorder) ? 20 : reorder,
          expiry_date: formData.expiry_date,
          supplier_id: Number(formData.supplier_id),
          description: formData.description.trim(),
          status: formData.status
        });
        setNotification({ type: 'success', message: 'Medicine added successfully to pharmacy catalog!' });
      }

      setIsAddEditOpen(false);
      refreshList();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmMed) return;
    const res = storage.deleteMedicine(deleteConfirmMed.medicine_id);
    setNotification({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
    setDeleteConfirmMed(null);
    refreshList();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>Medicine Inventory & Master Records</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmaceuticals, batch numbers, prices, stock levels, and supplier links.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Medicine, Generic Name, Batch #, or Category..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Medicines</option>
              <option value="Inactive">Inactive / Deactivated</option>
            </select>
          </div>
        </div>

        {/* Secondary sorting & count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredMedicines.length}</strong> of{' '}
            <strong className="text-slate-800">{medicines.length}</strong> total medicines in database
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 font-medium"
            >
              <option value="name">Name</option>
              <option value="quantity">Current Stock</option>
              <option value="selling_price">Selling Price</option>
              <option value="expiry_date">Expiry Date</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold text-slate-700"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Medicine & Generic</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Batch #</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map(med => {
                  const isLow = med.quantity <= med.reorder_level;
                  const isExpired = new Date(med.expiry_date) < new Date();

                  return (
                    <tr key={med.medicine_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{med.medicine_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{med.generic_name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {med.category_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {med.batch_no}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-slate-900">{settings.currency_symbol}{med.selling_price.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">Cost: {settings.currency_symbol}{med.purchase_price.toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className={`inline-block font-bold px-2 py-0.5 rounded text-xs ${
                          med.quantity === 0
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {med.quantity}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Reorder: {med.reorder_level}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {med.expiry_date}
                        </span>
                        {isExpired && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                            EXPIRED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          med.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {med.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingMedicine(med)}
                            title="View Full Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(med)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmMed(med)}
                            title="Delete or Deactivate"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition font-medium"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-semibold ${
                  currentPage === page
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <span>{editingMedicine ? 'Edit Medicine Record' : 'Add New Pharmaceutical to Database'}</span>
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Brand / Medicine Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.medicine_name}
                    onChange={e => setFormData({ ...formData, medicine_name: e.target.value })}
                    placeholder="e.g. Dolo 650mg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Generic Name / Salts</label>
                  <input
                    type="text"
                    value={formData.generic_name}
                    onChange={e => setFormData({ ...formData, generic_name: e.target.value })}
                    placeholder="e.g. Paracetamol IP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Micro Labs Ltd"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batch_no}
                    onChange={e => setFormData({ ...formData, batch_no: e.target.value })}
                    placeholder="e.g. DL65-2026A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier / Wholesaler</label>
                  <select
                    value={formData.supplier_id}
                    onChange={e => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {suppliers.map(s => (
                      <option key={s.supplier_id} value={s.supplier_id}>
                        {s.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Purchase Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchase_price}
                    onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selling Price / MRP (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={e => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Quantity in Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={formData.reorder_level}
                    onChange={e => setFormData({ ...formData, reorder_level: e.target.value })}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Indications</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical usage, storage instructions, caution..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {editingMedicine ? 'Update Medicine' : 'Save to MySQL Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MEDICINE DETAILS MODAL */}
      {viewingMedicine && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">{viewingMedicine.medicine_name}</h3>
                <span className="text-slate-500 font-mono text-[11px]">{viewingMedicine.generic_name}</span>
              </div>
              <button onClick={() => setViewingMedicine(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Category</span>
                  <span className="font-semibold text-slate-800">{viewingMedicine.category_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Batch Number</span>
                  <span className="font-mono font-semibold text-slate-800">{viewingMedicine.batch_no}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Selling Price</span>
                  <span className="font-bold text-slate-900 text-sm">{settings.currency_symbol}{viewingMedicine.selling_price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Purchase Price</span>
                  <span className="font-semibold text-slate-700">{settings.currency_symbol}{viewingMedicine.purchase_price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Stock Available</span>
                  <span className="font-bold text-teal-700 text-sm">{viewingMedicine.quantity} units</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Expiry Date</span>
                  <span className="font-semibold text-slate-800">{viewingMedicine.expiry_date}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Manufacturer & Supplier</span>
                <p className="text-slate-700">Manufacturer: <strong>{viewingMedicine.manufacturer}</strong></p>
                <p className="text-slate-700">Assigned Supplier: <strong>{viewingMedicine.supplier_name}</strong></p>
              </div>

              {viewingMedicine.description && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Description</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {viewingMedicine.description}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingMedicine(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE / DEACTIVATE CONFIRMATION MODAL (Section 32) */}
      {deleteConfirmMed && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900">Confirm Medicine Deletion</h3>
            </div>

            <p className="text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteConfirmMed.medicine_name}"</strong> (Batch: {deleteConfirmMed.batch_no})?
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] mb-4">
              <strong className="block mb-0.5">DBMS Relational Integrity Guarantee:</strong>
              If this medicine has previous sales history or purchase batches, it will be safely deactivated (Status: Inactive) rather than hard-deleted to prevent broken foreign key references in historical bills.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmMed(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-sm"
              >
                Confirm Delete / Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
