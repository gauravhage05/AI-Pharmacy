import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Printer,
  Download,
  Share2,
  Eye,
  Calendar,
  CreditCard,
  Receipt
} from 'lucide-react';
import { Sale } from '../types';
import { storage } from '../services/storage';
import { BillModal } from './BillModal';
import { generateInvoicePDF } from '../services/pdfGenerator';
import { WhatsAppService } from '../services/whatsappService';

export const SalesHistoryView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(storage.getSales());
  const settings = storage.getSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    return sales
      .filter(s => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          s.bill_number.toLowerCase().includes(q) ||
          s.customer_name.toLowerCase().includes(q) ||
          (s.customer_phone && s.customer_phone.includes(q)) ||
          s.sale_date.includes(q);

        const matchesPayment = paymentFilter === 'all' || s.payment_method === paymentFilter;

        return matchesSearch && matchesPayment;
      })
      .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
  }, [sales, searchQuery, paymentFilter]);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total_amount, 0);

  const handleDownloadPDF = (sale: Sale) => {
    try {
      generateInvoicePDF(sale, settings);
      setNotice(`Downloaded PDF for ${sale.bill_number}`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setNotice(`PDF error: ${err.message}`);
    }
  };

  const handleWhatsApp = (sale: Sale) => {
    const res = WhatsAppService.openWhatsApp(sale, settings);
    setNotice(res.message);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <span>Sales History & Invoicing Archive</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs of all counter transactions, customer bills, PDF re-prints, and WhatsApp shares.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs text-xs flex items-center gap-3">
          <Receipt className="w-4 h-4 text-teal-600" />
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Filtered Total</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {settings.currency_symbol}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-medium">
          {notice}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Bill Number (e.g. INV-1001), Customer, Phone, or Date..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI Transactions</option>
              <option value="Cash">Cash Payments</option>
              <option value="Card">Card Payments</option>
              <option value="Other">Other Modes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bill Number</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3 text-center">Items Billed</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-center">Payment Mode</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No sales records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const hasPhone = Boolean(sale.customer_phone && sale.customer_phone.replace(/\D/g, '').length >= 10);
                  const itemCount = sale.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr key={sale.sale_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {sale.bill_number}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {sale.sale_date}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{sale.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{sale.customer_phone || 'No phone'}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {itemCount} units ({sale.items.length} meds)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                        {settings.currency_symbol}{sale.total_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {sale.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Modal */}
                          <button
                            onClick={() => setSelectedSale(sale)}
                            title="View / Print Bill"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadPDF(sale)}
                            title="Download PDF Invoice"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {/* WhatsApp */}
                          <button
                            onClick={() => handleWhatsApp(sale)}
                            disabled={!hasPhone}
                            title={hasPhone ? `WhatsApp to ${sale.customer_phone}` : 'No phone number available'}
                            className={`p-1.5 rounded-lg transition ${
                              hasPhone
                                ? 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <Share2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Bill View / Print / WhatsApp Modal */}
      {selectedSale && (
        <BillModal
          sale={selectedSale}
          settings={settings}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
};
