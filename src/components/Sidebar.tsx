import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Tags,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  Boxes,
  ClockAlert,
  BrainCircuit,
  BarChart3,
  UserCheck,
  Database,
  Settings,
  LogOut,
  ShieldCheck,
  FileCode2,
  PhoneCall
} from 'lucide-react';
import { User } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'medicines'
  | 'categories'
  | 'suppliers'
  | 'customers'
  | 'purchases'
  | 'billing'
  | 'sales_history'
  | 'inventory'
  | 'expiry'
  | 'ai_prediction'
  | 'reports'
  | 'users'
  | 'dbms_showcase'
  | 'code_viewer'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onLogout: () => void;
  lowStockCount: number;
  expiringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  lowStockCount,
  expiringCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Sales / Billing', icon: Receipt, badge: 'POS' },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'inventory', label: 'Inventory', icon: Boxes, alert: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'expiry', label: 'Expiry Alerts', icon: ClockAlert, alert: expiringCount > 0 ? expiringCount : undefined },
    { id: 'ai_prediction', label: 'AI Demand Forecast', icon: BrainCircuit, highlight: true },
    { id: 'sales_history', label: 'Sales History', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: Truck },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'users', label: 'Staff & Roles', icon: UserCheck, adminOnly: true },
    { id: 'dbms_showcase', label: 'DBMS Viva & SQL', icon: Database, badge: 'Viva' },
    { id: 'code_viewer', label: 'Python & SQL Code', icon: FileCode2, badge: 'Code' },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Pill className="w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-base text-white truncate leading-tight tracking-tight">
            Apex Health
          </h1>
          <p className="text-[11px] text-teal-400 font-medium truncate">
            AI Pharmacy Management
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
          Operations & Inventory
        </div>
        {navItems.slice(0, 7).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'}`} />
              <span className="truncate flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                  {item.badge}
                </span>
              )}
              {item.alert !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  {item.alert}
                </span>
              )}
            </button>
          );
        })}

        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 mb-1">
          Catalog & Relations
        </div>
        {navItems.slice(7, 12).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 mb-1">
          DBMS Project & Admin
        </div>
        {navItems.slice(12).map(item => {
          if (item.adminOnly && currentUser?.role !== 'Admin') return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* College Project Team Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px]">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">Project Team</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">DBMS</span>
        </div>
        <div className="text-slate-400 space-y-0.5 text-[10px] leading-tight">
          <p className="truncate text-teal-300 font-medium">1. Gaurav S. Hage</p>
          <p className="truncate">2. Arpit M. Kogde</p>
          <p className="truncate">3. Shishir M. Mankar</p>
          <p className="truncate">4. Saurabh D. Alone</p>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs shrink-0">
            {currentUser?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser?.full_name || 'Guest'}
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span className="text-[10px] text-teal-400 font-medium">{currentUser?.role || 'Staff'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign Out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
