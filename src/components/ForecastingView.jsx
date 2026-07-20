import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Layers, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  BarChart2,
  PackageCheck
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { calculateCategoryForecast, calculateProductStockoutPredictions } from '../services/forecastingEngine';
import { hasPermission, PERMISSIONS } from '../config/rbac';

export default function ForecastingView({ products, onRestockItem, currentUser }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [forecastDays, setForecastDays] = useState(30); // 30, 60, 90
  const [reorderPlacedSuccess, setReorderPlacedSuccess] = useState(null);

  const forecastData = calculateCategoryForecast(selectedCategory, forecastDays);
  const stockoutPredictions = calculateProductStockoutPredictions(products);

  const criticalStockouts = stockoutPredictions.filter(p => p.isCritical);

  const handlePlaceAutomatedOrder = (product) => {
    onRestockItem(product.id, product.recommendedReorder);
    setReorderPlacedSuccess(`Automated Reorder Order placed for ${product.recommendedReorder} units of ${product.name}!`);
    setTimeout(() => setReorderPlacedSuccess(null), 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Banner & Control Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> TIME SERIES DEMAND PREDICTION
          </span>
          <h2 className="text-xl font-extrabold text-slate-100">AI Stock Sales & Replenishment Forecasting</h2>
          <p className="text-xs text-slate-400">Predict future sales velocity, category trends, and stockout timelines</p>
        </div>

        {/* Controls: Horizon & Category */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Horizon */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setForecastDays(days)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  forecastDays === days
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {['All', 'Clothing', 'Groceries', 'Miscellaneous'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {reorderPlacedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{reorderPlacedSuccess}</span>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projected Demand</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">
            {forecastData.totalProjectedUnits.toLocaleString()} <span className="text-xs text-slate-400 font-normal">units</span>
          </h3>
          <p className="text-[11px] text-indigo-400 font-medium mt-1">Expected sales over next {forecastDays} days</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Sales Velocity</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">
            ~{forecastData.avgDailyBurn} <span className="text-xs text-slate-400 font-normal">units / day</span>
          </h3>
          <p className="text-[11px] text-cyan-400 font-medium mt-1">Calculated inventory burn rate</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category Trend</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">
            +7.8% <span className="text-xs text-slate-400 font-normal">monthly growth</span>
          </h3>
          <p className="text-[11px] text-emerald-300 font-medium mt-1">Weighted exponential trend</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-amber-900/50 p-5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stockout Risk</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-amber-400">
            {criticalStockouts.length} <span className="text-xs text-slate-400 font-normal">items critical</span>
          </h3>
          <p className="text-[11px] text-amber-300 font-medium mt-1">Predicted stockout &lt; 14 days</p>
        </div>
      </div>

      {/* Main Time Series Sales Forecast Chart */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              Time Series Sales History & 3-Month Projection
            </h3>
            <p className="text-xs text-slate-400">Historical monthly sales data connected to ML predicted trend lines</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <span className="w-3 h-0.5 bg-indigo-500 inline-block" /> Clothing
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Groceries
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" /> Miscellaneous
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData.chartPoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value} Units`, 'Sales Volume']}
              />
              <Line 
                type="monotone" 
                dataKey="Clothing" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#6366f1' }} 
              />
              <Line 
                type="monotone" 
                dataKey="Groceries" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981' }} 
              />
              <Line 
                type="monotone" 
                dataKey="Miscellaneous" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f59e0b' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Stockout Prediction & Automated Reorder Queue */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100">Stockout Timeline & Automated Supplier Reorders</h3>
              <p className="text-xs text-slate-400">Products ordered by predicted depletion date based on velocity</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/60">
                <th className="py-3 px-4">SKU / Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Daily Sales Velocity</th>
                <th className="py-3 px-4">Est. Stockout Date</th>
                <th className="py-3 px-4">Rec. Reorder Qty</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stockoutPredictions.map((p) => {
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-indigo-400 font-bold block">{p.sku}</span>
                      <span className="font-bold text-slate-100 text-xs">{p.name}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {p.stock} {p.unit || 'pcs'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.dailyVelocity} units / day
                    </td>

                    <td className="py-3.5 px-4">
                      {p.daysUntilStockout <= 14 ? (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> In {p.daysUntilStockout} Days
                        </span>
                      ) : p.daysUntilStockout <= 30 ? (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          In {p.daysUntilStockout} Days
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          In {p.daysUntilStockout} Days
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-indigo-300">
                      +{p.recommendedReorder} units
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handlePlaceAutomatedOrder(p)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 ml-auto"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Place Reorder</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
