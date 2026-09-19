import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Coins,
  Percent,
  Boxes,
  ClockAlert,
  ShoppingBag
} from 'lucide-react';
import { storage } from '../services/storage';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<'sales' | 'purchases' | 'inventory' | 'profit'>('profit');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const settings = storage.getSettings();
  const sales = storage.getSales();
  const purchases = storage.getPurchases();
  const medicines = storage.getMedicines();

  // Profit & Revenue Analysis calculations
  const totalRevenue = sales.reduce((s, sale) => s + sale.total_amount, 0);

  // Calculate COGS (Cost of goods sold based on actual items sold)
  let totalCOGS = 0;
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const med = medicines.find(m => m.medicine_id === item.medicine_id);
      const unitCost = med ? med.purchase_price : item.price * 0.7; // fallback
      totalCOGS += item.quantity * unitCost;
    });
  });

  const grossProfit = Math.max(0, totalRevenue - totalCOGS);
  const profitMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalInventoryValue = medicines.reduce((s, m) => s + m.quantity * m.selling_price, 0);
  const totalInventoryCost = medicines.reduce((s, m) => s + m.quantity * m.purchase_price, 0);
  const totalPurchasesAmount = purchases.reduce((s, p) => s + p.total_amount, 0);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'sales') {
      csvContent += 'Bill Number,Date,Customer,Phone,Items Count,Subtotal,Discount,Total Amount,Payment Mode\n';
      sales.forEach(s => {
        csvContent += `"${s.bill_number}","${s.sale_date}","${s.customer_name}","${s.customer_phone}","${s.items.length}",${s.subtotal},${s.discount},${s.total_amount},"${s.payment_method}"\n`;
      });
    } else if (reportType === 'purchases') {
      csvContent += 'Purchase ID,Date,Supplier,Medicine,Batch,Quantity,Unit Cost,Total Amount\n';
      purchases.forEach(p => {
        const item = p.items && p.items.length > 0 ? p.items[0] : null;
        const medName = p.medicine_name || item?.medicine_name || 'N/A';
        const batch = p.batch_no || item?.batch_no || 'N/A';
        const qty = p.quantity !== undefined ? p.quantity : (item?.quantity || 0);
        const cost = p.purchase_price !== undefined ? p.purchase_price : (item?.purchase_price || 0);
        csvContent += `"PO-${p.purchase_id}","${p.purchase_date}","${p.supplier_name || 'N/A'}","${medName}","${batch}",${qty},${cost},${p.total_amount}\n`;
      });
    } else {
      csvContent += 'Medicine,Generic,Batch,Quantity,Purchase Price,Selling Price,Total Valuation,Status\n';
      medicines.forEach(m => {
        csvContent += `"${m.medicine_name}","${m.generic_name}","${m.batch_no}",${m.quantity},${m.purchase_price},${m.selling_price},${(m.quantity * m.selling_price).toFixed(2)},"${m.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pharmacy_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Financial Analytics & Audit Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SQL aggregate reporting, gross profit margin analysis, procurement ledger, and CSV export.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export {reportType.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        {[
          { id: 'profit', label: 'Profit & Margins Analysis', icon: TrendingUp },
          { id: 'sales', label: 'Sales Revenue Report', icon: DollarSign },
          { id: 'purchases', label: 'Procurement Purchases', icon: ShoppingBag },
          { id: 'inventory', label: 'Stock Valuation Audit', icon: Boxes }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setReportType(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                reportType === t.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* PROFIT & MARGINS SECTION */}
      {reportType === 'profit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Total Billed Sales Revenue
              </span>
              <div className="text-2xl font-black text-slate-900">
                {settings.currency_symbol}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">From {sales.length} completed transactions</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Cost of Goods Sold (COGS)
              </span>
              <div className="text-2xl font-black text-slate-700">
                {settings.currency_symbol}{totalCOGS.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Procurement cost basis</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
              <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Gross Trading Profit
              </span>
              <div className="text-2xl font-black text-emerald-800">
                {settings.currency_symbol}{grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">Revenue minus COGS</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Profit Margin
              </span>
              <div className="text-2xl font-black text-teal-700">{profitMarginPercent}%</div>
              <div className="text-[11px] text-slate-500 mt-1">Net gross markup efficiency</div>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">High-Margin Pharmaceuticals (Contribution Analysis)</h3>
            <p className="text-xs text-slate-500">Margin contribution per unit based on recorded purchase cost vs selling price.</p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3 text-right">Cost Price</th>
                    <th className="py-2.5 px-3 text-right">Selling Price</th>
                    <th className="py-2.5 px-3 text-right">Unit Profit</th>
                    <th className="py-2.5 px-3 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {medicines.slice(0, 8).map(m => {
                    const unitProf = Math.max(0, m.selling_price - m.purchase_price);
                    const pct = m.selling_price > 0 ? ((unitProf / m.selling_price) * 100).toFixed(1) : '0';

                    return (
                      <tr key={m.medicine_id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{m.medicine_name}</td>
                        <td className="py-2.5 px-3 text-right">{settings.currency_symbol}{m.purchase_price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{settings.currency_symbol}{m.selling_price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+{settings.currency_symbol}{unitProf.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 text-[10px]">
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SALES REPORT */}
      {reportType === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900">Total Invoices Logged: {sales.length}</span>
            <span className="font-extrabold text-teal-800">Total Billed: {settings.currency_symbol}{totalRevenue.toFixed(2)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Bill #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-center">Items</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sales.map(s => (
                  <tr key={s.sale_id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.bill_number}</td>
                    <td className="py-2.5 px-3">{s.sale_date}</td>
                    <td className="py-2.5 px-3 font-medium">{s.customer_name}</td>
                    <td className="py-2.5 px-3 text-center">{s.items.reduce((acc, i) => acc + i.quantity, 0)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{settings.currency_symbol}{s.total_amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px]">{s.payment_method}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PURCHASES REPORT */}
      {reportType === 'purchases' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900">Total Purchase Orders: {purchases.length}</span>
            <span className="font-extrabold text-teal-800">Total Outlay: {settings.currency_symbol}{totalPurchasesAmount.toFixed(2)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">PO #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3 font-mono">Batch</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {purchases.map(p => {
                  const item = p.items && p.items.length > 0 ? p.items[0] : null;
                  const medName = p.medicine_name || item?.medicine_name || 'N/A';
                  const batch = p.batch_no || item?.batch_no || 'N/A';
                  const qty = p.quantity !== undefined ? p.quantity : (item?.quantity || 0);

                  return (
                    <tr key={p.purchase_id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">PO-10{p.purchase_id}</td>
                      <td className="py-2.5 px-3">{p.purchase_date}</td>
                      <td className="py-2.5 px-3 font-medium">{p.supplier_name || 'N/A'}</td>
                      <td className="py-2.5 px-3">{medName}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{batch}</td>
                      <td className="py-2.5 px-3 text-center font-bold">+{qty}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">{settings.currency_symbol}{p.total_amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT */}
      {reportType === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900">Total Active Medicines: {medicines.length}</span>
            <span className="font-extrabold text-teal-800">Retail Stock Value: {settings.currency_symbol}{totalInventoryValue.toLocaleString()}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-right">Cost Value</th>
                  <th className="py-2.5 px-3 text-right">Retail Value</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {medicines.map(m => (
                  <tr key={m.medicine_id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.medicine_name}</td>
                    <td className="py-2.5 px-3 font-mono">{m.batch_no}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{m.quantity}</td>
                    <td className="py-2.5 px-3 text-right">{settings.currency_symbol}{(m.quantity * m.purchase_price).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">{settings.currency_symbol}{(m.quantity * m.selling_price).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.quantity <= m.reorder_level ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.quantity <= m.reorder_level ? 'Low Stock' : 'Safe'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
