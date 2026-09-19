import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  PlusCircle,
  AlertCircle,
  Copy,
  Receipt
} from 'lucide-react';
import { Sale, PharmacySettings } from '../types';
import { generateInvoicePDF } from '../services/pdfGenerator';
import { WhatsAppService } from '../services/whatsappService';

interface BillModalProps {
  sale: Sale | null;
  settings: PharmacySettings;
  onClose: () => void;
  onNewSale?: () => void;
}

export const BillModal: React.FC<BillModalProps> = ({
  sale,
  settings,
  onClose,
  onNewSale
}) => {
  if (!sale) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      generateInvoicePDF(sale, settings);
      setActionNotice('Invoice PDF downloaded successfully!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setActionNotice('PDF generation failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleWhatsApp = () => {
    const res = WhatsAppService.openWhatsApp(sale, settings);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCopyWhatsAppText = () => {
    const text = WhatsAppService.formatBillMessage(sale, settings);
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setActionNotice('WhatsApp message text copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setActionNotice(null), 3000;
    }, 3000);
  };

  const hasPhone = Boolean(sale.customer_phone && sale.customer_phone.replace(/\D/g, '').length >= 10);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Top Header (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">Invoice Generated Successfully</h3>
              <p className="text-[11px] text-teal-300 font-mono">Invoice #{sale.bill_number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              id="btn-print-bill"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Print Bill</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              id="btn-download-pdf"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            {/* WhatsApp Bill Button */}
            <button
              onClick={handleWhatsApp}
              disabled={!hasPhone}
              id="btn-send-whatsapp"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 ${
                hasPhone
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={hasPhone ? `Send to ${sale.customer_phone}` : 'Customer phone number is not available.'}
            >
              <Share2 className="w-4 h-4" />
              <span>Send Bill on WhatsApp</span>
            </button>

            {/* Copy WhatsApp Message Text */}
            <button
              onClick={handleCopyWhatsAppText}
              title="Copy formatted WhatsApp text to clipboard"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition text-xs"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {onNewSale && (
            <button
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>New Sale</span>
            </button>
          )}
        </div>

        {/* Action Notice feedback banner */}
        {actionNotice && (
          <div className="bg-teal-50 border-b border-teal-200 px-6 py-2 text-xs text-teal-900 font-medium flex items-center gap-2 no-print">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {!hasPhone && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-1.5 text-[11px] text-amber-800 flex items-center gap-2 no-print">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Customer phone number is not available. WhatsApp button disabled.</span>
          </div>
        )}

        {/* PRINTABLE BILL AREA (Requirement 14, 15, 45) */}
        <div id="printable-bill-area" className="p-8 text-slate-800 bg-white select-text">
          {/* Pharmacy Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="inline-block p-1.5 bg-teal-50 rounded-xl mb-1 border border-teal-100 no-print">
              <span className="text-teal-700 font-extrabold text-xs tracking-wider uppercase">Retail & Clinical Pharmacy</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {settings.pharmacy_name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{settings.tagline}</p>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">{settings.address}</p>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center justify-center gap-3">
              <span><strong>Phone:</strong> {settings.phone}</span>
              <span>•</span>
              <span><strong>Email:</strong> {settings.email}</span>
              <span>•</span>
              <span><strong>GSTIN:</strong> {settings.gst_number}</span>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="py-4 border-b border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Invoice Info</div>
              <div className="font-bold text-slate-900 text-sm font-mono">{sale.bill_number}</div>
              <div className="text-slate-600 mt-0.5">Date: {sale.sale_date}</div>
              <div className="text-slate-600">Payment Mode: <strong className="text-slate-800">{sale.payment_method}</strong></div>
              <div className="text-slate-500 text-[11px]">Billed by: {sale.created_by_user || 'Staff'}</div>
            </div>

            <div className="text-right">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Billed To Customer</div>
              <div className="font-bold text-slate-900 text-sm">{sale.customer_name}</div>
              <div className="text-slate-600 font-mono">{sale.customer_phone || 'No Phone Registered'}</div>
              <div className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                PAID IN FULL
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-slate-800 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-1">#</th>
                  <th className="py-2 px-2">Medicine Description</th>
                  <th className="py-2 px-2 font-mono">Batch</th>
                  <th className="py-2 px-2 text-right">Price</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2 px-1 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2 font-bold text-slate-900">{item.medicine_name}</td>
                    <td className="py-2 px-2 font-mono text-slate-500 text-[11px]">{item.batch_no || 'NA'}</td>
                    <td className="py-2 px-2 text-right">{settings.currency_symbol}{item.price.toFixed(2)}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2 px-1 text-right font-bold text-slate-900">
                      {settings.currency_symbol}{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="pt-3 border-t-2 border-slate-200 flex justify-end text-xs">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{settings.currency_symbol}{sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>-{settings.currency_symbol}{sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>Grand Total:</span>
                <span className="text-base text-teal-800">{settings.currency_symbol}{sale.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Legal / Medical Terms */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1 text-center">
            <p>1. Take prescription medicines strictly according to doctor's dosage.</p>
            <p>2. Keep medicines stored below 25°C away from direct sunlight & out of reach of children.</p>
            <p className="font-bold text-slate-700 text-xs mt-2">
              Thank you for visiting {settings.pharmacy_name}! Wish you good health.
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print text-xs">
          <div className="text-slate-500">
            Click <strong>Print Bill</strong> or <strong>Download PDF</strong> to issue physical or digital invoice.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
