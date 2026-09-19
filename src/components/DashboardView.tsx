import React from 'react';
import {
  Pill,
  Tags,
  Truck,
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  ClockAlert,
  Coins,
  BrainCircuit,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { storage } from '../services/storage';
import { AIDemandPredictionService } from '../services/aiDemandPrediction';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const kpis = storage.getDashboardKPIs();
  const settings = storage.getSettings();
  const topSelling = storage.getTopSellingMedicines(5);
  const lowStock = storage.getLowStockMedicines().slice(0, 4);
  const expiring = storage.getExpiryStatusMedicines().filter(m => m.expiryStatus !== 'Safe').slice(0, 4);

  // Quick AI predictions for 3 key medicines
  const aiHighlights = [1, 2, 4].map(medId => {
    try {
      return AIDemandPredictionService.predictDemand(medId, 15);
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Recent 7-day sales calculation for visual bar chart
  const sales = storage.getSales();
  const today = new Date();
  const chartDays: { label: string; date: string; amount: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayTotal = sales
      .filter(s => s.sale_date.startsWith(dateStr))
      .reduce((sum, s) => sum + s.total_amount, 0);

    chartDays.push({
      label: dayName,
      date: dateStr,
      amount: dayTotal
    });
  }

  const maxSales = Math.max(...chartDays.map(c => c.amount), 500);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* College Project Banner & Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold tracking-wide uppercase mb-2 border border-teal-500/30">
            DBMS Mini Project • Academic Year 2026
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            AI-Enabled Pharmacy Management System
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Engineered by <strong className="text-white">Gaurav Hage</strong>, <strong className="text-white">Arpit Kogde</strong>, <strong className="text-white">Shishir Mankar</strong>, and <strong className="text-white">Saurabh Alone</strong>.
            Demonstrating relational database normalization, ACID transactions, inventory automation, WhatsApp billing, and AI demand regression.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('billing')}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            <span>Open POS Billing</span>
          </button>
          <button
            onClick={() => setActiveTab('dbms_showcase')}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
          >
            DBMS Viva Queries
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Today's Sales</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-bold text-slate-900">{settings.currency_symbol}{kpis.todaySales.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Live from Sales table</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Monthly Sales</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Calendar className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-bold text-slate-900">{settings.currency_symbol}{kpis.monthlySales.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Current calendar month</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Inventory Value</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><Coins className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-bold text-slate-900">{settings.currency_symbol}{kpis.totalStockValue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">SUM(quantity × selling_price)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Low Stock Alert</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-bold text-amber-600">{kpis.lowStockCount} Meds</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">qty &le; reorder_level</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Expiring Soon / Expired</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><ClockAlert className="w-4 h-4" /></div>
          </div>
          <div className="text-xl font-bold text-rose-600">{kpis.expiringCount} Batches</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">Expired or &le; 30 days</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Medicines</span>
            <Pill className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">{kpis.totalMedicines} Active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Categories</span>
            <Tags className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">{kpis.totalCategories} Groups</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Suppliers</span>
            <Truck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">{kpis.totalSuppliers} Vendors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Customers</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">{kpis.totalCustomers} Accounts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-center">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">DBMS Integrity</div>
          <div className="text-xs font-bold text-teal-700 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Foreign Keys Enforced
          </div>
        </div>
      </div>

      {/* Main Two Columns: Sales Trend & Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (7 Days) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">7-Day Sales Revenue Trend</h3>
              <p className="text-xs text-slate-500">Live aggregate calculation from completed billing transactions</p>
            </div>
            <button
              onClick={() => setActiveTab('sales_history')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              View Sales History &rarr;
            </button>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {chartDays.map(day => {
              const heightPercent = Math.max(8, Math.round((day.amount / maxSales) * 100));
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                    ₹{day.amount.toLocaleString()}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-40">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all duration-500 group-hover:from-teal-500 group-hover:to-teal-300"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-700 block">{day.label}</span>
                    <span className="text-[9px] text-slate-400 block">{day.date.slice(5)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Aggregated via SQL: <code>SELECT DATE(sale_date), SUM(total_amount) GROUP BY DATE(sale_date)</code></span>
            <span className="font-semibold text-slate-700">Currency: {settings.currency_symbol} (INR)</span>
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Top Selling Medicines</h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">By Volume</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {topSelling.map((med, idx) => (
              <div key={med.medicine_name} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-slate-900 truncate max-w-[140px]">{med.medicine_name}</div>
                    <div className="text-[10px] text-slate-500">{med.total_quantity} units dispensed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-slate-900">₹{med.revenue.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Revenue</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className="w-full mt-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg text-center transition"
          >
            Detailed Analytics & Reports
          </button>
        </div>
      </div>

      {/* AI Medicine Demand Prediction Summary Widget */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-5 rounded-2xl text-white border border-indigo-900/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                <span>AI Medicine Demand Forecast Summary</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                  Linear Regression ML
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                15-Day projected demand calculated from historical sales transactions
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('ai_prediction')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Launch Prediction Engine</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {aiHighlights.map(pred => {
            if (!pred) return null;
            return (
              <div key={pred.medicine_id} className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white truncate">{pred.medicine_name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      pred.urgency === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      pred.urgency === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {pred.urgency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-black/30 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">Current Stock</div>
                      <div className="text-sm font-bold text-white">{pred.current_stock} units</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <div className="text-[10px] text-indigo-300">15-Day Demand</div>
                      <div className="text-sm font-bold text-indigo-300">{pred.predicted_demand} units</div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                  {pred.recommendation}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>* Forecasts are mathematical regression projections for inventory review. Not for medical diagnosis.</span>
          <span className="text-indigo-300 font-semibold">Features: Day Index, Moving Avg, Seasonality</span>
        </div>
      </div>

      {/* Critical Stock & Expiry Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Watch */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Low Stock Medicines</h3>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              View All ({kpis.lowStockCount})
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>All medicine inventory levels are above reorder threshold.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStock.map(med => (
                <div key={med.medicine_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{med.medicine_name}</div>
                    <div className="text-[11px] text-slate-500">Batch: {med.batch_no} • {med.manufacturer}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      {med.quantity} in stock
                    </span>
                    <div className="text-[10px] text-slate-400">Reorder at {med.reorder_level}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClockAlert className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">Expiry Alert Watchlist</h3>
            </div>
            <button
              onClick={() => setActiveTab('expiry')}
              className="text-xs font-semibold text-rose-700 hover:underline"
            >
              Manage ({kpis.expiringCount})
            </button>
          </div>

          {expiring.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>No expired or critical expiring batches found in next 60 days.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {expiring.map(med => (
                <div key={med.medicine_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{med.medicine_name}</div>
                    <div className="text-[11px] text-slate-500">Batch: {med.batch_no} • Qty: {med.quantity}</div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      med.expiryStatus === 'Expired'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {med.expiryStatus === 'Expired' ? 'EXPIRED' : `${med.daysRemaining} days left`}
                    </span>
                    <div className="text-[10px] text-slate-400">Expires: {med.expiry_date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
