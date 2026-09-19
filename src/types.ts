export type UserRole = 'Admin' | 'Pharmacist' | 'Staff';

export interface User {
  user_id: number;
  username: string;
  password?: string;
  password_hash?: string;
  role: UserRole;
  full_name: string;
  email?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  gst_number: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Customer {
  customer_id: number;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface Medicine {
  medicine_id: number;
  medicine_name: string;
  generic_name: string;
  category_id: number;
  category_name?: string;
  manufacturer: string;
  batch_no: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  reorder_level: number;
  expiry_date: string; // YYYY-MM-DD
  supplier_id: number;
  supplier_name?: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface PurchaseItem {
  purchase_item_id: number;
  purchase_id: number;
  medicine_id: number;
  medicine_name?: string;
  batch_no: string;
  quantity: number;
  purchase_price: number;
  expiry_date: string;
  total_cost: number;
}

export interface Purchase {
  purchase_id: number;
  supplier_id: number;
  supplier_name?: string;
  purchase_date: string;
  total_amount: number;
  invoice_ref?: string;
  items: PurchaseItem[];
  medicine_id?: number;
  medicine_name?: string;
  batch_no?: string;
  quantity?: number;
  purchase_price?: number;
  expiry_date?: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
  unit_price: number;
  total: number;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Other';

export interface SaleItem {
  sale_item_id: number;
  sale_id: number;
  medicine_id: number;
  medicine_name?: string;
  batch_no?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  sale_id: number;
  bill_number: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  created_by_user?: string;
  items: SaleItem[];
}

export interface SalesHistoryRecord {
  record_id: number;
  medicine_id: number;
  medicine_name: string;
  sale_date: string;
  quantity_sold: number;
}

export interface AIPredictionResult {
  medicine_id: number;
  medicine_name: string;
  current_stock: number;
  period_days: 7 | 15 | 30;
  predicted_demand: number;
  average_daily_demand: number;
  trend_direction: 'increasing' | 'stable' | 'decreasing';
  recommendation: string;
  urgency: 'critical' | 'warning' | 'normal' | 'surplus';
  historical_chart_data: { date: string; actual: number; predicted?: number }[];
  projected_chart_data: { date: string; predicted: number }[];
}

export interface PharmacySettings {
  pharmacy_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gst_number: string;
  currency_symbol: string;
}
