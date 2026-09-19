import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Database,
  BarChart2
} from 'lucide-react';
import { storage } from '../services/storage';
import { AIDemandPredictionService } from '../services/aiDemandPrediction';
import { AIPredictionResult, Medicine } from '../types';

export const AIPredictionView: React.FC = () => {
  const medicines = storage.getMedicines().filter(m => m.status === 'Active');
  const [selectedMedId, setSelectedMedId] = useState<number>(medicines[0]?.medicine_id || 1);
  const [periodDays, setPeriodDays] = useState<7 | 15 | 30>(15);
  const [prediction, setPrediction] = useState<AIPredictionResult | null>(null);
  const [isCrunching, setIsCrunching] = useState(false);

  // Compute prediction on mount or when user clicks Predict
  const runPrediction = () => {
    setIsCrunching(true);
    setTimeout(() => {
      try {
        const res = AIDemandPredictionService.predictDemand(selectedMedId, periodDays);
        setPrediction(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCrunching(false);
      }
    }, 250);
  };

  useEffect(() => {
    runPrediction();
  }, [selectedMedId, periodDays]);

  const selectedMed = medicines.find(m => m.medicine_id === selectedMedId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white border border-indigo-900/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold tracking-wide uppercase mb-2 border border-indigo-500/30">
              <BrainCircuit className="w-3.5 h-3.5" />
              Machine Learning Inventory Intelligence
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              AI Medicine Demand Prediction
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Uses Scikit-Learn Ordinary Least Squares (OLS) Linear Regression and temporal moving averages
              to forecast upcoming pharmaceutical consumption and guide safe reorder decisions.
            </p>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-right text-xs">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Algorithm Architecture</div>
            <div className="font-mono font-bold text-teal-300 mt-0.5">OLS Linear Regression (y = mx + c)</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Features: Day Index, Moving Avg, Seasonality</div>
          </div>
        </div>
      </div>

      {/* Safety & Academic Disclaimer (Requirements 25 & 49) */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Healthcare & Project Demonstration Notice:</strong> Predictions are mathematical
          estimates computed from historical sales data solely for pharmacy supply-chain & inventory review.
          This system does NOT provide clinical diagnostics, medical dosage guidelines, or prescription recommendations.
        </div>
      </div>

      {/* Controls Card: Medicine Selector, Period, and Run Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Medicine Dropdown */}
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Medicine
            </label>
            <select
              value={selectedMedId}
              onChange={e => setSelectedMedId(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
            >
              {medicines.map(m => (
                <option key={m.medicine_id} value={m.medicine_id}>
                  {m.medicine_name} ({m.generic_name}) • Current Stock: {m.quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Forecast Horizon */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Prediction Period
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {([7, 15, 30] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setPeriodDays(days)}
                  className={`py-2 text-xs font-bold rounded-lg border transition text-center ${
                    periodDays === days
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Button */}
          <div className="md:col-span-3">
            <button
              onClick={runPrediction}
              disabled={isCrunching}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isCrunching ? 'Training & Inferring...' : 'Predict Demand'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {prediction && (
        <div className="space-y-6">
          {/* Metrics Trio */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Analyzed Medicine
              </span>
              <div className="font-black text-slate-900 text-base">{prediction.medicine_name}</div>
              <div className="text-xs text-slate-500 mt-0.5">Salt: {selectedMed?.generic_name}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Current Inventory Stock
              </span>
              <div className="font-black text-slate-900 text-2xl">{prediction.current_stock} <span className="text-xs font-semibold text-slate-500">units</span></div>
              <div className="text-xs text-slate-500 mt-0.5">Reorder Threshold: {selectedMed?.reorder_level} units</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                AI Predicted {prediction.period_days}-Day Demand
              </span>
              <div className="font-black text-indigo-900 text-2xl">{prediction.predicted_demand} <span className="text-xs font-semibold text-indigo-700">units</span></div>
              <div className="text-xs text-indigo-700 font-medium mt-0.5">Avg: {prediction.average_daily_demand} units / day</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Trend & Status
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  prediction.urgency === 'critical' ? 'bg-rose-100 text-rose-800' :
                  prediction.urgency === 'warning' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {prediction.urgency}
                </span>
                <span className="text-xs font-semibold text-slate-600 capitalize">
                  {prediction.trend_direction} demand
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Horizon: Next {prediction.period_days} days
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className={`p-4 rounded-2xl border ${
            prediction.urgency === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-900' :
            prediction.urgency === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
              <Info className="w-4 h-4" />
              <span>Suggested Stock Action & Review</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed">
              {prediction.recommendation}
            </p>
          </div>

          {/* Visual Chart: Historical Sales vs Predicted Demand (Requirement 26) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <span>Historical Sales vs Predicted Demand Trend</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Last 14 days historical sales points (solid teal) plotted alongside future {prediction.period_days} days AI forecast (dashed indigo).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
                  <span className="text-slate-600 font-medium">Historical Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
                  <span className="text-slate-600 font-medium">AI Projected Demand</span>
                </div>
              </div>
            </div>

            {/* Visual SVG / HTML Chart */}
            <div className="pt-4">
              <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-200">
                {/* Historical Bars */}
                {prediction.historical_chart_data.map(item => {
                  const maxVal = Math.max(
                    ...prediction.historical_chart_data.map(h => h.actual),
                    ...prediction.projected_chart_data.map(p => p.predicted),
                    10
                  );
                  const hPercent = Math.max(8, Math.round((item.actual / maxVal) * 100));

                  return (
                    <div key={'hist-' + item.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                        {item.actual}
                      </div>
                      <div className="w-full bg-slate-100 rounded-t h-48 flex items-end">
                        <div
                          style={{ height: `${hPercent}%` }}
                          className="w-full bg-teal-500 rounded-t transition-all group-hover:bg-teal-400"
                        />
                      </div>
                      <div className="text-[9px] text-slate-400 rotate-45 sm:rotate-0 mt-1">{item.date}</div>
                    </div>
                  );
                })}

                <div className="w-px h-52 bg-slate-300 mx-1 border-dashed"></div>

                {/* Projected Bars */}
                {prediction.projected_chart_data.slice(0, 15).map(item => {
                  const maxVal = Math.max(
                    ...prediction.historical_chart_data.map(h => h.actual),
                    ...prediction.projected_chart_data.map(p => p.predicted),
                    10
                  );
                  const hPercent = Math.max(8, Math.round((item.predicted / maxVal) * 100));

                  return (
                    <div key={'proj-' + item.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="text-[9px] font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition">
                        {item.predicted}
                      </div>
                      <div className="w-full bg-indigo-50 rounded-t h-48 flex items-end border border-indigo-200 border-b-0">
                        <div
                          style={{ height: `${hPercent}%` }}
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all group-hover:from-indigo-500 group-hover:to-indigo-300"
                        />
                      </div>
                      <div className="text-[9px] text-indigo-700 font-bold rotate-45 sm:rotate-0 mt-1">+{item.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Pipeline Architecture Demonstration (Section 27) */}
          <div className="bg-slate-900 rounded-2xl p-6 text-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-400" />
              <span>DBMS to AI/ML Machine Learning Pipeline</span>
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-teal-400 font-bold block mb-1">Step 1</span>
                <strong className="text-white block">MySQL Query</strong>
                <span className="text-[10px] text-slate-400">SELECT from sales_history</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-teal-400 font-bold block mb-1">Step 2</span>
                <strong className="text-white block">Pandas DF</strong>
                <span className="text-[10px] text-slate-400">Data cleaning & sorting</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-teal-400 font-bold block mb-1">Step 3</span>
                <strong className="text-white block">Feature Eng.</strong>
                <span className="text-[10px] text-slate-400">Day index, moving avg</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-teal-400 font-bold block mb-1">Step 4</span>
                <strong className="text-white block">Scikit-Learn</strong>
                <span className="text-[10px] text-slate-400">LinearRegression.fit()</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-teal-400 font-bold block mb-1">Step 5</span>
                <strong className="text-white block">Inference</strong>
                <span className="text-[10px] text-slate-400">Next N-days projection</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-teal-400 font-bold block mb-1">Step 6</span>
                <strong className="text-white block">Inventory Review</strong>
                <span className="text-[10px] text-slate-400">Reorder recommendation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
