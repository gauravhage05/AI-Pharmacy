import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  UserPlus,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Pill,
  ShoppingBag,
  ArrowRight,
  Printer
} from 'lucide-react';
import { Medicine, Customer, CartItem, PaymentMethod, Sale } from '../types';
import { storage } from '../services/storage';
import { BillModal } from './BillModal';

interface BillingViewProps {
  onSaleCompleted: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onSaleCompleted }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(storage.getMedicines());
  const [customers, setCustomers] = useState<Customer[]>(storage.getCustomers());
  const settings = storage.getSettings();

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.customer_id || 1);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Quick Customer Creation modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Notifications & Active Bill Modal
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeBill, setActiveBill] = useState<Sale | null>(null);

  // Filter medicines for live search
  const searchedMedicines = useMemo(() => {
    if (!medicineSearch.trim()) return [];
    const q = medicineSearch.toLowerCase().trim();
    return medicines
      .filter(
        m =>
          m.status === 'Active' &&
          (m.medicine_name.toLowerCase().includes(q) ||
            m.generic_name.toLowerCase().includes(q) ||
            m.batch_no.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [medicines, medicineSearch]);

  const selectedCustomer = customers.find(c => c.customer_id === selectedCustomerId) || customers[0];

  const handleAddToCart = (med: Medicine) => {
    // Check if expired
    const todayStr = new Date().toISOString().split('T')[0];
    if (med.expiry_date < todayStr) {
      setNotice({
        type: 'error',
        message: `Cannot sell expired medicine "${med.medicine_name}" (Batch ${med.batch_no} expired on ${med.expiry_date})!`
      });
      return;
    }

    if (med.quantity <= 0) {
      setNotice({
        type: 'error',
        message: `Insufficient stock available: "${med.medicine_name}" is currently out of stock.`
      });
      return;
    }

    const existingIndex = cart.findIndex(item => item.medicine.medicine_id === med.medicine_id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > med.quantity) {
        setNotice({
          type: 'error',
          message: `Insufficient stock available for "${med.medicine_name}". Available in stock: ${med.quantity}.`
        });
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          medicine: med,
          quantity: 1,
          unit_price: med.selling_price,
          total: med.selling_price
        }
      ]);
    }

    setMedicineSearch('');
    setNotice(null);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    const item = cart[index];
    if (newQty > item.medicine.quantity) {
      setNotice({
        type: 'error',
        message: `Insufficient stock available for "${item.medicine.medicine_name}". Available: ${item.medicine.quantity}.`
      });
      return;
    }

    const updated = [...cart];
    updated[index].quantity = newQty;
    updated[index].total = Number((newQty * item.unit_price).toFixed(2));
    setCart(updated);
    setNotice(null);
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discount = Math.max(0, parseFloat(discountAmount) || 0);
  const grandTotal = Math.max(0, Number((subtotal - discount).toFixed(2)));

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      setNotice({ type: 'error', message: 'Customer name is required.' });
      return;
    }
    const newCust = storage.addCustomer({
      customer_name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim(),
      address: newCustAddress.trim()
    });

    const updatedCustomers = storage.getCustomers();
    setCustomers(updatedCustomers);
    setSelectedCustomerId(newCust.customer_id);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    setNotice({ type: 'success', message: `Customer "${newCust.customer_name}" added and selected for billing!` });
  };

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      setNotice({ type: 'error', message: 'Cart is empty. Please select medicines before generating bill.' });
      return;
    }

    if (!selectedCustomer) {
      setNotice({ type: 'error', message: 'Please select a customer for this invoice.' });
      return;
    }

    // Execute atomic DBMS transaction
    const result = storage.completeSaleTransaction({
      customer_id: selectedCustomer.customer_id,
      customer_name: selectedCustomer.customer_name,
      customer_phone: selectedCustomer.phone,
      items: cart,
      discount,
      payment_method: paymentMethod
    });

    if (!result.success || !result.sale) {
      setNotice({ type: 'error', message: result.message });
      return;
    }

    // Refresh state
    setMedicines(storage.getMedicines());
    setCart([]);
    setDiscountAmount('0');
    setNotice({ type: 'success', message: result.message });
    setActiveBill(result.sale);
    onSaleCompleted();
  };

  const resetForNewSale = () => {
    setCart([]);
    setDiscountAmount('0');
    setMedicineSearch('');
    setNotice(null);
    setActiveBill(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <span>Pharmacy POS & Billing Counter</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant stock verification, automated inventory deduction transaction, and WhatsApp invoicing.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          notice.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Billing Grid: Left (Customer & Medicine Selection) / Right (Cart & Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Customer + Medicine Search */}
        <div className="lg:col-span-7 space-y-5">
          {/* Customer Selection Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Customer Information</span>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ New Customer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  {customers.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.customer_name} ({c.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp Invoice Target</div>
                <div className="font-bold text-slate-900 truncate">{selectedCustomer?.customer_name}</div>
                <div className="text-emerald-700 font-mono text-[11px]">
                  {selectedCustomer?.phone || '⚠️ No phone (WhatsApp disabled)'}
                </div>
              </div>
            </div>
          </div>

          {/* Medicine Search Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Medicine Search & Quick Add</span>
              <span className="text-[10px] text-slate-400">Type brand or salt name</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={medicineSearch}
                onChange={e => setMedicineSearch(e.target.value)}
                placeholder="Search Dolo, Augmentin, Cetzine, Paracetamol, etc..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {medicineSearch && (
                <button
                  onClick={() => setMedicineSearch('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search Results Dropdown / Grid */}
            {medicineSearch && (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {searchedMedicines.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active medicines found matching "{medicineSearch}".
                  </div>
                ) : (
                  searchedMedicines.map(med => {
                    const isExpired = new Date(med.expiry_date) < new Date();
                    const isOutOfStock = med.quantity <= 0;

                    return (
                      <div
                        key={med.medicine_id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{med.medicine_name}</div>
                          <div className="text-[11px] text-slate-500">{med.generic_name} • Batch: {med.batch_no}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-700 font-semibold">{settings.currency_symbol}{med.selling_price.toFixed(2)}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              Stock: {med.quantity}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                                EXPIRED
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(med)}
                          disabled={isOutOfStock || isExpired}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            isOutOfStock || isExpired
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Bill</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Quick Medicine Shortcuts */}
            {!medicineSearch && (
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-2">Fast Dispense (Frequently Sold):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {medicines.slice(0, 6).map(m => (
                    <button
                      key={m.medicine_id}
                      onClick={() => handleAddToCart(m)}
                      className="p-2.5 text-left rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition group"
                    >
                      <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900 truncate">
                        {m.medicine_name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{settings.currency_symbol}{m.selling_price.toFixed(2)}</span>
                        <span className="font-medium text-emerald-700">{m.quantity} left</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Active Cart & Checkout */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">Current Sale Cart</h3>
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Pill className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>Cart is empty.</p>
                  <p className="text-[11px] text-slate-400">Search and add medicines from catalog.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={item.medicine.medicine_id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                      <div className="font-bold text-slate-900 truncate">{item.medicine.medicine_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {settings.currency_symbol}{item.unit_price.toFixed(2)} each • Max: {item.medicine.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.medicine.quantity}
                        value={item.quantity}
                        onChange={e => handleUpdateQuantity(idx, parseInt(e.target.value) || 1)}
                        className="w-10 text-center py-0.5 border border-slate-200 rounded font-bold text-xs"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right w-16 shrink-0">
                      <div className="font-bold text-slate-900">{settings.currency_symbol}{item.total.toFixed(2)}</div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{settings.currency_symbol}{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(e.target.value)}
                  className="w-24 px-2 py-1 text-right border border-slate-200 rounded font-semibold text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="font-bold text-sm">Grand Total:</span>
                <span className="font-black text-xl text-teal-700">
                  {settings.currency_symbol}{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector (Requirement 12) */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['UPI', 'Cash', 'Card', 'Other'] as PaymentMethod[]).map(pm => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-2 px-1 rounded-lg font-bold border transition text-center ${
                      paymentMethod === pm
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            {/* Complete Sale & Generate Bill Button */}
            <button
              onClick={handleGenerateBill}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Complete Sale & Generate Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ADD CUSTOMER MODAL */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              <span>Register New Customer</span>
            </h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number (for WhatsApp Bill)
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="+91 98234 56789"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Used for sending direct WhatsApp bills</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={e => setNewCustEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Landmark</label>
                <textarea
                  rows={2}
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  placeholder="Street, City..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Modal (Print, Download PDF, WhatsApp) */}
      {activeBill && (
        <BillModal
          sale={activeBill}
          settings={settings}
          onClose={() => setActiveBill(null)}
          onNewSale={resetForNewSale}
        />
      )}
    </div>
  );
};
