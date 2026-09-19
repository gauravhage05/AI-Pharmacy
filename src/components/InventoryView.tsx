import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Coins
} from 'lucide-react';
import { storage } from '../services/storage';
import { Medicine } from '../types';

export const InventoryView: React.FC = () => {
  const medicines = storage.getMedicines();
  const settings = storage.getSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  const inventoryItems = useMemo(() => {
    return medicines
      .map(m => {
        let invStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (m.quantity <= 0) {
          invStatus = 'out_of_stock';
        } else if (m.quantity <= m.reorder_level) {
          invStatus = 'low_stock';
        }

        const stockValue = m.quantity * m.selling_price;
        const costValue = m.quantity * m.purchase_price;

        return {
          ...m,
          invStatus,
          stockValue,
          costValue
        };
      })
      .filter(item => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          item.medicine_name.toLowerCase().includes(query) ||
          item.generic_name.toLowerCase().includes(query) ||
          item.batch_no.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'all' || item.invStatus === statusFilter;

        return matchesQuery && matchesStatus;
      });
  }, [medicines, searchQuery, statusFilter]);

  const totalStockValue = inventoryItems.reduce((acc, i) => acc + i.stockValue, 0);
  const totalUnits = inventoryItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            <span>Pharmacy Inventory & Stock Valuation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor on-hand units, batches, reorder safety thresholds, and retail valuation.
          </p>
        </div>

        {/* Quick summary pill */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs text-xs">
          <Coins className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Filtered Valuation</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {settings.currency_symbol}{totalStockValue.toLocaleString()}
            </span>
          </div>
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
              placeholder="Search inventory by medicine, salt, or batch number..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="all">All Inventory Statuses</option>
              <option value="in_stock">In Stock (Normal)</option>
              <option value="low_stock">Low Stock (Needs Review)</option>
              <option value="out_of_stock">Out of Stock (Zero Units)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{inventoryItems.length}</strong> items • Total Units:{' '}
            <strong className="text-slate-800">{totalUnits.toLocaleString()}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              <CheckCircle2 className="w-3 h-3" /> In Stock
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
              <AlertTriangle className="w-3 h-3" /> Low Stock
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
              <XCircle className="w-3 h-3" /> Out of Stock
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Medicine & Salts</th>
                <th className="py-3 px-3">Batch #</th>
                <th className="py-3 px-3 text-center">On-Hand Stock</th>
                <th className="py-3 px-3 text-center">Reorder Level</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Total Stock Value</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {inventoryItems.map(item => (
                <tr key={item.medicine_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.medicine_name}</div>
                    <div className="text-[11px] text-slate-500">{item.generic_name} • {item.category_name}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {item.batch_no}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                      item.invStatus === 'out_of_stock'
                        ? 'bg-rose-100 text-rose-800'
                        : item.invStatus === 'low_stock'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-600">
                    {item.reorder_level} units
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-800">
                    {settings.currency_symbol}{item.selling_price.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {settings.currency_symbol}{item.stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.invStatus === 'out_of_stock'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.invStatus === 'low_stock'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.invStatus === 'out_of_stock' ? 'Out of Stock' : item.invStatus === 'low_stock' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
