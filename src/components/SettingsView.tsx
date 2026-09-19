import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  Receipt,
  Users2,
  GraduationCap
} from 'lucide-react';
import { storage } from '../services/storage';
import { PharmacySettings } from '../types';

interface SettingsViewProps {
  onSettingsChanged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSettingsChanged }) => {
  const [settings, setSettings] = useState<PharmacySettings>(storage.getSettings());
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      storage.saveSettings(settings);
      setNotice({ type: 'success', message: 'Pharmacy settings and invoice details saved successfully!' });
      onSettingsChanged();
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to save settings.' });
    }
  };

  const handleResetDatabase = () => {
    storage.resetToDefaults();
    setSettings(storage.getSettings());
    setShowResetConfirm(false);
    setNotice({ type: 'success', message: 'Database reset to default college demonstration sample dataset!' });
    onSettingsChanged();
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <span>Pharmacy Profile & System Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure retail store details, invoice headers, tax identification numbers, and currency symbols.
          </p>
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          notice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pharmacy / Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.pharmacy_name}
                onChange={e => setSettings({ ...settings, pharmacy_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Slogan / Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (Official Contact)</label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN / Drug License Number</label>
              <input
                type="text"
                value={settings.gst_number}
                onChange={e => setSettings({ ...settings, gst_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currency_symbol}
                onChange={e => setSettings({ ...settings, currency_symbol: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Store Address (Printed on Invoices)</label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Sample Database</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Pharmacy Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Project Team Card (Section Requirement) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>College DBMS Mini Project • Engineering Credits</span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">Project Title:</h3>
          <p className="text-sm text-teal-200 font-semibold mt-0.5">
            AI-Enabled Pharmacy Management System with Medicine Demand Prediction
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Team Members:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { name: 'Gaurav Subhash Hage', role: 'Full Stack & Database Lead' },
              { name: 'Arpit Murlidhar Kogde', role: 'DBMS Architecture & Schema' },
              { name: 'Shishir Madhav Mankar', role: 'AI Demand ML & Analytics' },
              { name: 'Saurabh Dnyaneshwar Alone', role: 'UI/UX & POS Billing Engine' }
            ].map(m => (
              <div key={m.name} className="bg-white/10 p-3 rounded-xl border border-white/10">
                <strong className="text-white block font-bold">{m.name}</strong>
                <span className="text-[11px] text-teal-300 block mt-0.5">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-2">Reset to Demo Dataset?</h3>
            <p className="text-slate-600 mb-4 leading-relaxed">
              This will re-initialize the pharmacy database with the curated academic sample catalog of medicines,
              categories, suppliers, sales transactions, and training data points.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
