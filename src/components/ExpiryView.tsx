import React, { useState, useMemo } from 'react';
import {
  ClockAlert,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  RotateCcw,
  Truck
} from 'lucide-react';
import { storage } from '../services/storage';

export const ExpiryView: React.FC = () => {
  const [expiryList, setExpiryList] = useState(storage.getExpiryStatusMedicines());
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'expired' | '30' | '60' | '90'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return expiryList.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.medicine_name.toLowerCase().includes(q) ||
        item.batch_no.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q);

      let matchesPeriod = true;
      if (filterPeriod === 'expired') {
        matchesPeriod = item.expiryStatus === 'Expired';
      } else if (filterPeriod === '30') {
        matchesPeriod = item.expiryStatus === 'Expired' || item.daysRemaining <= 30;
      } else if (filterPeriod === '60') {
        matchesPeriod = item.expiryStatus === 'Expired' || item.daysRemaining <= 60;
      } else if (filterPeriod === '90') {
        matchesPeriod = item.expiryStatus === 'Expired' || item.daysRemaining <= 90;
      }

      return matchesSearch && matchesPeriod;
    });
  }, [expiryList, filterPeriod, searchQuery]);

  const expiredCount = expiryList.filter(i => i.expiryStatus === 'Expired').length;
  const criticalCount = expiryList.filter(i => i.expiryStatus === 'Expiring Soon').length;

  const handleReturnToSupplier = (medName: string, batchNo: string, supplierName: string) => {
    setActionNotice(`Initiated supplier return order for "${medName}" (Batch ${batchNo}) to supplier "${supplierName}".`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClockAlert className="w-5 h-5 text-rose-600" />
            <span>Medicine Expiry Date Tracking & Quarantine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict surveillance of pharmaceutical shelf-life to guarantee patient safety and enable supplier returns.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 font-bold border border-rose-200">
            {expiredCount} Expired Batches
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200">
            {criticalCount} Expiring Soon (&le;30d)
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Safety Compliance Banner */}
      <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs text-rose-950 flex items-start gap-3">
        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Drug Regulatory Compliance (Pharmacy Act & Rules):</strong>
          <p className="mt-0.5 text-rose-800 leading-relaxed">
            Dispensing expired medicine is strictly prohibited. The system automatically locks expired batches from
            being added to customer billing carts in the POS checkout interface.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name, batch number, or manufacturer..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="all">All Expiry Windows ({expiryList.length})</option>
              <option value="expired">Expired Batches Only ({expiredCount})</option>
              <option value="30">Expiring in &le; 30 Days</option>
              <option value="60">Expiring in &le; 60 Days</option>
              <option value="90">Expiring in &le; 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expiry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-3">Batch #</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3 text-center">Remaining Stock</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Days Remaining</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.map(item => {
                const isExp = item.expiryStatus === 'Expired';
                const isSoon = item.expiryStatus === 'Expiring Soon';

                return (
                  <tr key={item.medicine_id} className={`transition ${
                    isExp ? 'bg-rose-50/40 hover:bg-rose-50/70' :
                    isSoon ? 'bg-amber-50/30 hover:bg-amber-50/60' :
                    'hover:bg-slate-50/80'
                  }`}>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{item.medicine_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.generic_name}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-700">
                      {item.batch_no}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.manufacturer}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {item.quantity} units
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {item.expiry_date}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${
                        isExp ? 'text-rose-700' : isSoon ? 'text-amber-700' : 'text-slate-600'
                      }`}>
                        {isExp ? `${Math.abs(item.daysRemaining)} days ago` : `${item.daysRemaining} days`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isExp
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isSoon
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.expiryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isExp || isSoon ? (
                        <button
                          onClick={() => handleReturnToSupplier(item.medicine_name, item.batch_no, item.supplier_name || 'Primary Wholesaler')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3 text-teal-400" />
                          <span>Return</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Safe</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
