import React, { useState } from 'react';
import {
  Bell,
  Search,
  PlusCircle,
  Receipt,
  BrainCircuit,
  Database,
  ShieldCheck,
  AlertTriangle,
  ClockAlert,
  ChevronDown
} from 'lucide-react';
import { User, UserRole, Medicine } from '../types';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
  setActiveTab: (tab: ActiveTab) => void;
  lowStockList: Medicine[];
  expiringList: Medicine[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  setActiveTab,
  lowStockList,
  expiringList
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  const totalAlerts = lowStockList.length + expiringList.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left Search / Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700">DBMS Mode:</span>
          <span>Normalized MySQL Schema • In-Memory ACID</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action: New Sale */}
        <button
          onClick={() => setActiveTab('billing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Receipt className="w-4 h-4" />
          <span>New Bill (POS)</span>
        </button>

        {/* Quick Action: AI Forecast */}
        <button
          onClick={() => setActiveTab('ai_prediction')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition"
        >
          <BrainCircuit className="w-4 h-4 text-indigo-600" />
          <span>AI Demand ML</span>
        </button>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertDropdown(!showAlertDropdown)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalAlerts}
              </span>
            )}
          </button>

          {showAlertDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800">
                <span>Pharmacy Alerts ({totalAlerts})</span>
                <span className="text-[10px] text-slate-500">Live checks</span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {lowStockList.length > 0 && (
                  <div className="p-3 bg-amber-50/50">
                    <div className="flex items-center gap-2 font-semibold text-amber-800 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lowStockList.length} Medicines Low on Stock</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 pl-5 list-disc text-[11px]">
                      {lowStockList.slice(0, 3).map(m => (
                        <li key={m.medicine_id}>
                          {m.medicine_name}: only <span className="font-bold text-amber-900">{m.quantity}</span> left (reorder at {m.reorder_level})
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setActiveTab('inventory');
                        setShowAlertDropdown(false);
                      }}
                      className="mt-2 text-amber-800 text-[11px] font-semibold hover:underline block"
                    >
                      View All in Inventory →
                    </button>
                  </div>
                )}

                {expiringList.length > 0 && (
                  <div className="p-3 bg-rose-50/50">
                    <div className="flex items-center gap-2 font-semibold text-rose-800 mb-1">
                      <ClockAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>{expiringList.length} Medicines Expiring / Expired</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 pl-5 list-disc text-[11px]">
                      {expiringList.slice(0, 3).map(m => (
                        <li key={m.medicine_id}>
                          {m.medicine_name} (Expires: {m.expiry_date})
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setActiveTab('expiry');
                        setShowAlertDropdown(false);
                      }}
                      className="mt-2 text-rose-800 text-[11px] font-semibold hover:underline block"
                    >
                      Manage in Expiry Module →
                    </button>
                  </div>
                )}

                {totalAlerts === 0 && (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    All stock levels and expiry schedules are currently safe.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fast Role Switcher (For Demo & Viva) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Role: <strong className="text-slate-900">{currentUser?.role || 'Staff'}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Role for Demo
              </div>
              {(['Admin', 'Pharmacist', 'Staff'] as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => {
                    onSwitchRole(role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between ${
                    currentUser?.role === role ? 'font-bold text-teal-700 bg-teal-50/60' : 'text-slate-700'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser?.role === role && <span className="text-[10px] text-teal-600">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
