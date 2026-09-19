import { Sale, PharmacySettings } from '../types';

export class WhatsAppService {
  /**
   * Normalizes phone number into international format for WhatsApp:
   * wa.me requires digits only, with country code (e.g. 919823456789 for India)
   */
  public static normalizePhoneNumber(rawPhone: string): string {
    if (!rawPhone) return '';
    // Strip all non-numeric characters
    let cleaned = rawPhone.replace(/\D/g, '');

    // If Indian 10-digit number without country code
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    // If starts with 0 (e.g. 09823456789)
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.substring(1);
    }
    return cleaned;
  }

  /**
   * Format the WhatsApp bill text message as specified in requirement 17
   */
  public static formatBillMessage(sale: Sale, settings: PharmacySettings): string {
    const customerFirstName = sale.customer_name ? sale.customer_name.split(' ')[0] : 'Valued Customer';
    
    // Format medicine lines: "Dolo 650mg × 2"
    const itemsList = sale.items
      .map(item => `${item.medicine_name || 'Medicine'} × ${item.quantity} (₹${item.total.toFixed(2)})`)
      .join('\n');

    const message = 
`Hello ${customerFirstName},

Thank you for purchasing from ${settings.pharmacy_name}.

📋 *Bill No:* ${sale.bill_number}
📅 *Date:* ${sale.sale_date.split(' ')[0]}

*Purchased Medicines:*
${itemsList}

💰 *Subtotal:* ${settings.currency_symbol}${sale.subtotal.toFixed(2)}
${sale.discount > 0 ? `🏷️ *Discount:* -${settings.currency_symbol}${sale.discount.toFixed(2)}\n` : ''}💵 *Total Amount:* ${settings.currency_symbol}${sale.total_amount.toFixed(2)}
💳 *Payment:* ${sale.payment_method}

Thank you for visiting us. Wish you a speedy recovery and good health! 🌿
📍 *Address:* ${settings.address}
📞 *Contact:* ${settings.phone}`;

    return message;
  }

  /**
   * Generate official WhatsApp click-to-chat URL
   */
  public static getWhatsAppUrl(sale: Sale, settings: PharmacySettings): { url: string; error?: string } {
    const normalizedPhone = this.normalizePhoneNumber(sale.customer_phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return {
        url: '',
        error: 'Customer phone number is not available or invalid. Please update the customer phone to send WhatsApp bills.'
      };
    }

    const message = this.formatBillMessage(sale, settings);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;

    return { url };
  }

  /**
   * Open WhatsApp in a new tab safely
   */
  public static openWhatsApp(sale: Sale, settings: PharmacySettings): { success: boolean; message: string } {
    const { url, error } = this.getWhatsAppUrl(sale, settings);
    if (error || !url) {
      return { success: false, message: error || 'Failed to construct WhatsApp message link.' };
    }

    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return { success: true, message: 'Opening WhatsApp with prefilled pharmacy invoice!' };
    } catch {
      // In case iframe restricts window.open, provide fallback
      return { success: false, message: 'Could not open new window automatically. Please copy the WhatsApp link.' };
    }
  }
}
