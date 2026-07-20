import React, { useState } from 'react';
import { 
  BrainCircuit, 
  ShoppingCart, 
  Flame, 
  Package, 
  PieChart as PieIcon, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp,
  Layers,
  Zap,
  AlertCircle,
  Percent
} from 'lucide-react';
import { 
  runMarketBasketAnalysis, 
  runFSNAnalysis, 
  runABCAnalysis 
} from '../services/dataScienceEngine';

export default function DataScienceAnalyticsView({ products, onAddToCart, setActiveTab }) {
  const [activeTab, setActiveAnalyticsTab] = useState('basket'); // 'basket' | 'fsn' | 'abc'

  const associationRules = runMarketBasketAnalysis(products);
  const fsnItems = runFSNAnalysis(products);
  const abcItems = runABCAnalysis(products);

  const fastMovingCount = fsnItems.filter(i => i.fsnCategory === 'F').length;
  const slowMovingCount = fsnItems.filter(i => i.fsnCategory === 'S').length;
  const nonMovingCount = fsnItems.filter(i => i.fsnCategory === 'N').length;

  const handleBundleAddToCart = (itemA, itemB) => {
    onAddToCart(itemA);
    onAddToCart(itemB);
    setActiveTab('pos');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20 inline-flex items-center gap-1.5 mb-2">
            <BrainCircuit className="w-3.5 h-3.5" /> DATA SCIENCE & RETAIL INTELLIGENCE
          </span>
          <h2 className="text-xl font-extrabold text-slate-100">Retail Analytics & Machine Learning Insights</h2>
          <p className="text-xs text-slate-400">Market Basket Analysis (Apriori), FSN Velocity & ABC Pareto Revenue Drivers</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveAnalyticsTab('basket')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'basket'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Bought Together</span>
          </button>

          <button
            onClick={() => setActiveAnalyticsTab('fsn')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'fsn'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>FSN Velocity</span>
          </button>

          <button
            onClick={() => setActiveAnalyticsTab('abc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'abc'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>ABC Pareto (80/20)</span>
          </button>
        </div>
      </div>

      {/* Content Section 1: Market Basket Analysis */}
      {activeTab === 'basket' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-400" />
                  Market Basket Co-Occurrence Rules (Apriori Algorithm)
                </h3>
                <p className="text-xs text-slate-400">Products frequently purchased in the same invoice basket</p>
              </div>

              <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">
                {associationRules.length} Association Rules Mined
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {associationRules.map((rule, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      RULE #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      rule.liftScore > 1.5 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      Lift Score: {rule.liftScore}x ({rule.affinityStrength} Affinity)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2 border-y border-slate-800/80">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Primary Product (A)</span>
                      <h4 className="font-bold text-slate-100 text-xs">{rule.itemA.name}</h4>
                      <span className="text-[10px] font-mono text-indigo-300">{rule.itemA.sku}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Co-Bought Product (B)</span>
                      <h4 className="font-bold text-slate-100 text-xs">{rule.itemB.name}</h4>
                      <span className="text-[10px] font-mono text-indigo-300">{rule.itemB.sku}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="space-x-3 text-slate-400">
                      <span>Support: <strong className="text-slate-200">{rule.supportPct}%</strong></span>
                      <span>Confidence: <strong className="text-emerald-400">{rule.confidencePct}%</strong></span>
                    </div>

                    <button
                      onClick={() => handleBundleAddToCart(rule.itemA, rule.itemB)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Add Bundle to POS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Section 2: FSN Velocity Analysis */}
      {activeTab === 'fsn' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-emerald-500/30 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fast-Moving (F)</span>
                <Flame className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-400">{fastMovingCount} Products</h3>
              <p className="text-xs text-slate-400 mt-1">High sales turnover rate (&gt; 1.5 turnover)</p>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/30 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slow-Moving (S)</span>
                <Package className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-400">{slowMovingCount} Products</h3>
              <p className="text-xs text-slate-400 mt-1">Moderate sales turnover (0.4 - 1.5 turnover)</p>
            </div>

            <div className="bg-slate-900/80 border border-red-500/30 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Non-Moving / Deadstock (N)</span>
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-red-400">{nonMovingCount} Products</h3>
              <p className="text-xs text-slate-400 mt-1">Low sales velocity (&lt; 0.4 turnover)</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-100">FSN Velocity Breakdown Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/60">
                    <th className="py-3 px-4">SKU / Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Est. Monthly Sales</th>
                    <th className="py-3 px-4">Turnover Ratio</th>
                    <th className="py-3 px-4">FSN Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fsnItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-mono text-indigo-400 font-bold block">{item.sku}</span>
                        <span className="font-bold text-slate-100">{item.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{item.category}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{item.stock} pcs</td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{item.monthlySalesUnits} units / mo</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">{item.turnoverRatio}x</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${item.badgeColor}`}>
                          {item.fsnLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content Section 3: ABC Pareto Classification */}
      {activeTab === 'abc' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-purple-400" />
                  ABC Inventory Pareto Analysis (80 / 20 Revenue Impact Rule)
                </h3>
                <p className="text-xs text-slate-400">Classifies items into Class A (75% revenue), Class B (20%), and Class C (5%)</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/60">
                    <th className="py-3 px-4">SKU / Product</th>
                    <th className="py-3 px-4">Retail Price</th>
                    <th className="py-3 px-4">Stock Units</th>
                    <th className="py-3 px-4">Total Inventory Valuation</th>
                    <th className="py-3 px-4">Cumulative Revenue %</th>
                    <th className="py-3 px-4">ABC Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {abcItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-mono text-indigo-400 font-bold block">{item.sku}</span>
                        <span className="font-bold text-slate-100">{item.name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-100">${item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-300">{item.stock} pcs</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400">${item.totalValuation.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">{item.cumulativePct}%</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${item.abcColor}`}>
                          {item.abcClass} - {item.abcClass === 'A' ? 'High Value' : item.abcClass === 'B' ? 'Moderate Value' : 'Low Value'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
