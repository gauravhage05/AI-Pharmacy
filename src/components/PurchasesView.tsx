import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Pill,
  Calendar,
  X
} from 'lucide-react';
import { Purchase, Medicine, Supplier } from '../types';
import { storage } from '../services/storage';

interface PurchasesViewProps {
  onPurchaseCompleted: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ onPurchaseCompleted }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(storage.getPurchases());
  const medicines = storage.getMedicines();
  const suppliers = storage.getSuppliers();
  const settings = storage.getSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    supplier_id: suppliers[0]?.supplier_id || 1,
    medicine_id: medicines[0]?.medicine_id || 1,
    batch_no: '',
    quantity: '50',
    purchase_price: '25.00',
    expiry_date: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    const med = medicines[0];
    setFormData({
      supplier_id: suppliers[0]?.supplier_id || 1,
      medicine_id: med?.medicine_id || 1,
      batch_no: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      quantity: '50',
      purchase_price: med ? String(med.purchase_price) : '20.00',
      expiry_date: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleMedicineChange = (medId: number) => {
    const med = medicines.find(m => m.medicine_id === medId);
    setFormData(prev => ({
      ...prev,
      medicine_id: medId,
      purchase_price: med ? String(med.purchase_price) : prev.purchase_price,
      supplier_id: med?.supplier_id || prev.supplier_id
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(formData.quantity);
    const price = parseFloat(formData.purchase_price);

    if (isNaN(qty) || qty <= 0) {
      setNotice({ type: 'error', message: 'Purchase quantity must be greater than zero.' });
      return;
    }
    if (isNaN(price) || price <= 0) {
      setNotice({ type: 'error', message: 'Purchase price must be a valid positive amount.' });
      return;
    }

    try {
      const res = storage.recordPurchase({
        supplier_id: Number(formData.supplier_id),
        medicine_id: Number(formData.medicine_id),
        batch_no: formData.batch_no.trim() || `BAT-${Date.now().toString().slice(-4)}`,
        quantity: qty,
        purchase_price: price,
        expiry_date: formData.expiry_date
      });

      setPurchases(storage.getPurchases());
      setIsModalOpen(false);
      setNotice({
        type: 'success',
        message: `Successfully received ${qty} units of medicine into inventory! Total: ${settings.currency_symbol}${res.total_amount.toFixed(2)}.`
      });
      onPurchaseCompleted();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to record purchase.' });
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const item = p.items && p.items.length > 0 ? p.items[0] : null;
    const medName = p.medicine_name || item?.medicine_name || '';
    const supName = p.supplier_name || '';
    const batch = p.batch_no || item?.batch_no || '';

    return (
      !q ||
      medName.toLowerCase().includes(q) ||
      supName.toLowerCase().includes(q) ||
      batch.toLowerCase().includes(q) ||
      p.purchase_date.includes(q)
    );
  });

  const totalSpent = filteredPurchases.reduce((s, p) => s + p.total_amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            <span>Procurement & Inward Purchases</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log supplier consignments and automatically replenish pharmaceutical stock inventory.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Consignment</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Medicine, Supplier, Batch, or Date..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="text-slate-500">
          Total Inward Outlay:{' '}
          <strong className="text-slate-900 font-extrabold text-sm">
            {settings.currency_symbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Purchase ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Supplier Name</th>
                <th className="py-3 px-3">Medicine Consignment</th>
                <th className="py-3 px-3 font-mono">Batch #</th>
                <th className="py-3 px-3 text-center">Qty Received</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Total Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No purchase consignments recorded.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(p => {
                  const item = p.items && p.items.length > 0 ? p.items[0] : null;
                  const medName = p.medicine_name || item?.medicine_name || 'Lot Consignment';
                  const expDate = p.expiry_date || item?.expiry_date || 'N/A';
                  const batchNo = p.batch_no || item?.batch_no || 'N/A';
                  const qty = p.quantity !== undefined ? p.quantity : (item?.quantity || 0);
                  const price = p.purchase_price !== undefined ? p.purchase_price : (item?.purchase_price || 0);

                  return (
                    <tr key={p.purchase_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        PO-10{p.purchase_id}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.purchase_date}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {p.supplier_name || 'Unknown Supplier'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{medName}</div>
                        <div className="text-[10px] text-slate-400">Exp: {expDate}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {batchNo}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        +{qty} units
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {settings.currency_symbol}{price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {settings.currency_symbol}{p.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW CONSIGNMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <span>Record Inward Stock Consignment</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Supplier</label>
                <select
                  value={formData.supplier_id}
                  onChange={e => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.supplier_name} ({s.contact_person})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine to Replenish</label>
                <select
                  value={formData.medicine_id}
                  onChange={e => handleMedicineChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {medicines.map(m => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.medicine_name} (Current Stock: {m.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={formData.batch_no}
                    onChange={e => setFormData({ ...formData, batch_no: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Received</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchase_price}
                    onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-900 text-xs">
                <strong>DBMS Automatic Trigger:</strong> Submitting this form executes an atomic inventory update:
                increasing medicine on-hand units and logging the transaction in the MySQL purchases ledger.
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
                  Record Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
