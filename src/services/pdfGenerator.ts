import jsPDF from 'jspdf';
import { Sale, PharmacySettings } from '../types';

export function generateInvoicePDF(sale: Sale, settings: PharmacySettings): void {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header - Pharmacy Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(settings.pharmacy_name.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(settings.tagline, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.text(settings.address, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.text(`Phone: ${settings.phone}  |  Email: ${settings.email}`, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.text(`GSTIN: ${settings.gst_number}`, pageWidth / 2, y, { align: 'center' });

  // Divider Line
  y += 5;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);

  // Invoice Title Pill
  y += 8;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(pageWidth / 2 - 25, y - 5, 50, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('TAX INVOICE', pageWidth / 2, y, { align: 'center' });

  // Invoice & Customer Info Box
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Invoice Details:', 14, y);
  doc.text('Billed To Customer:', 110, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No: ${sale.bill_number}`, 14, y);
  doc.text(`Name: ${sale.customer_name}`, 110, y);

  y += 4.5;
  doc.text(`Date & Time: ${sale.sale_date}`, 14, y);
  doc.text(`Phone: ${sale.customer_phone || 'N/A'}`, 110, y);

  y += 4.5;
  doc.text(`Payment Mode: ${sale.payment_method}`, 14, y);
  doc.text(`Cashier: ${sale.created_by_user || 'Staff'}`, 110, y);

  // Table Headers
  y += 9;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('#', 16, y);
  doc.text('Item Description', 25, y);
  doc.text('Batch', 95, y);
  doc.text('Qty', 125, y, { align: 'right' });
  doc.text('Unit Price', 155, y, { align: 'right' });
  doc.text('Amount (Rs)', pageWidth - 16, y, { align: 'right' });

  // Table Items
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  sale.items.forEach((item, index) => {
    y += 5.5;
    // Check page overflow if many items
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.text(String(index + 1), 16, y);
    doc.text(item.medicine_name || 'Medicine', 25, y);
    doc.text(item.batch_no || 'NA', 95, y);
    doc.text(String(item.quantity), 125, y, { align: 'right' });
    doc.text(item.price.toFixed(2), 155, y, { align: 'right' });
    doc.text(item.total.toFixed(2), pageWidth - 16, y, { align: 'right' });

    // subtle row divider
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(14, y + 1.5, pageWidth - 14, y + 1.5);
  });

  // Summary Section
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(110, y, pageWidth - 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal:', 130, y);
  doc.text(`Rs ${sale.subtotal.toFixed(2)}`, pageWidth - 16, y, { align: 'right' });

  if (sale.discount > 0) {
    y += 4.5;
    doc.setTextColor(22, 101, 52); // green-800
    doc.text('Discount Applied:', 130, y);
    doc.text(`- Rs ${sale.discount.toFixed(2)}`, pageWidth - 16, y, { align: 'right' });
    doc.setTextColor(51, 65, 85);
  }

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(125, y - 4, pageWidth - 139, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', 130, y + 1.5);
  doc.text(`Rs ${sale.total_amount.toFixed(2)}`, pageWidth - 16, y + 1.5, { align: 'right' });

  // Footer / Terms
  y += 20;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);

  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Please consult your physician before taking any prescription medicines.', 14, y);
  y += 4;
  doc.text('2. Goods once sold cannot be returned without original batch invoice and intact seal.', 14, y);
  y += 4;
  doc.text('3. This is a computer generated invoice and requires no physical signature.', 14, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Thank you for visiting Apex Health Pharmacy! Wish you good health.', pageWidth / 2, y, { align: 'center' });

  // Trigger browser download
  doc.save(`${sale.bill_number}_Invoice.pdf`);
}
