import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MedicinesView } from './components/MedicinesView';
import { BillingView } from './components/BillingView';
import { AIPredictionView } from './components/AIPredictionView';
import { InventoryView } from './components/InventoryView';
import { ExpiryView } from './components/ExpiryView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { PurchasesView } from './components/PurchasesView';
import { CategoriesView } from './components/CategoriesView';
import { SuppliersView } from './components/SuppliersView';
import { CustomersView } from './components/CustomersView';
import { ReportsView } from './components/ReportsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { DBMSShowcaseModal } from './components/DBMSShowcaseModal';
import { ProjectCodeViewerModal } from './components/ProjectCodeViewerModal';
import { storage } from './services/storage';
import { User, UserRole, Medicine } from './types';
import { LogIn, Pill, ShieldCheck, Database, Lock } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lowStockList, setLowStockList] = useState<Medicine[]>([]);
  const [expiringList, setExpiringList] = useState<Medicine[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Login form state (if user logs out)
  const [loginUsername, setLoginUsername] = useState('gaurav');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync low stock and expiring items
  const refreshAlerts = () => {
    setLowStockList(storage.getLowStockMedicines());
    setExpiringList(storage.getExpiryStatusMedicines().filter(m => m.expiryStatus !== 'Safe'));
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshAlerts();
  }, []);

  const handleSwitchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = storage.updateUser(currentUser.user_id, { role });
    if (updated) {
      storage.setCurrentUser(updated);
      setCurrentUser(updated);
    }
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const user = storage.authenticate(loginUsername.trim(), loginPassword.trim());
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
    } else {
      setLoginError('Invalid username or password. You can try: gaurav / admin123');
    }
  };

  // IF NOT LOGGED IN: SHOW PROFESSIONAL ACADEMIC LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-slate-200">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 mx-auto mb-3">
              <Pill className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Pharmacy Management System</h1>
            <p className="text-xs text-slate-400 mt-1">AI-Enabled Medicine Demand Prediction & DBMS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="e.g. gaurav or arpit"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Pharmacy Portal</span>
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <span className="font-bold text-slate-300 block">Preloaded Demo Logins:</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                type="button"
                onClick={() => { setLoginUsername('gaurav'); setLoginPassword('admin123'); }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
              >
                <strong className="block text-teal-300 font-bold">Admin</strong>
                <span>gaurav</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginUsername('arpit'); setLoginPassword('pharma123'); }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
              >
                <strong className="block text-indigo-300 font-bold">Pharmacist</strong>
                <span>arpit</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginUsername('saurabh'); setLoginPassword('staff123'); }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
              >
                <strong className="block text-slate-300 font-bold">Staff</strong>
                <span>saurabh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans text-slate-900 select-none">
      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Main Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          lowStockCount={lowStockList.length}
          expiringCount={expiringList.length}
        />

        {/* Content Area with Top Navbar and Dynamic View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar
            currentUser={currentUser}
            onSwitchRole={handleSwitchRole}
            setActiveTab={setActiveTab}
            lowStockList={lowStockList}
            expiringList={expiringList}
          />

          <main className="flex-1 overflow-y-auto bg-slate-50/60">
            {activeTab === 'dashboard' && (
              <DashboardView setActiveTab={setActiveTab} key={refreshKey} />
            )}

            {activeTab === 'medicines' && (
              <MedicinesView onRefreshStats={refreshAlerts} key={refreshKey} />
            )}

            {activeTab === 'billing' && (
              <BillingView onSaleCompleted={refreshAlerts} key={refreshKey} />
            )}

            {activeTab === 'ai_prediction' && (
              <AIPredictionView key={refreshKey} />
            )}

            {activeTab === 'inventory' && (
              <InventoryView key={refreshKey} />
            )}

            {activeTab === 'expiry' && (
              <ExpiryView key={refreshKey} />
            )}

            {activeTab === 'sales_history' && (
              <SalesHistoryView key={refreshKey} />
            )}

            {activeTab === 'purchases' && (
              <PurchasesView onPurchaseCompleted={refreshAlerts} key={refreshKey} />
            )}

            {activeTab === 'categories' && (
              <CategoriesView key={refreshKey} />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView key={refreshKey} />
            )}

            {activeTab === 'customers' && (
              <CustomersView key={refreshKey} />
            )}

            {activeTab === 'reports' && (
              <ReportsView key={refreshKey} />
            )}

            {activeTab === 'users' && (
              <UsersView currentUser={currentUser} onRefreshUsers={refreshAlerts} key={refreshKey} />
            )}

            {activeTab === 'dbms_showcase' && (
              <DBMSShowcaseModal key={refreshKey} />
            )}

            {activeTab === 'code_viewer' && (
              <ProjectCodeViewerModal key={refreshKey} />
            )}

            {activeTab === 'settings' && (
              <SettingsView onSettingsChanged={refreshAlerts} key={refreshKey} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
