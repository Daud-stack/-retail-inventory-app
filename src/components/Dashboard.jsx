import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Shirt, 
  ShoppingBag, 
  Box, 
  ArrowUpRight, 
  RefreshCw, 
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard({ products, onRestockItem, setActiveTab, setSelectedCategoryFilter }) {
  // Calculated Key Metrics
  const totalStockValue = products.reduce((acc, item) => acc + (item.stock * item.cost), 0);
  const totalPotentialRevenue = products.reduce((acc, item) => acc + (item.stock * item.price), 0);
  const lowStockItems = products.filter(item => item.stock <= item.minStock);
  const outOfStockItems = products.filter(item => item.stock === 0);
  const totalItemsCount = products.reduce((acc, item) => acc + item.stock, 0);

  // Category Breakdown for Pie Chart
  const categoryData = [
    { 
      name: 'Clothing', 
      value: products.filter(p => p.category === 'Clothing').reduce((acc, p) => acc + (p.stock * p.price), 0),
      count: products.filter(p => p.category === 'Clothing').length,
      color: '#6366f1' // Indigo
    },
    { 
      name: 'Groceries', 
      value: products.filter(p => p.category === 'Groceries').reduce((acc, p) => acc + (p.stock * p.price), 0),
      count: products.filter(p => p.category === 'Groceries').length,
      color: '#10b981' // Emerald
    },
    { 
      name: 'Miscellaneous', 
      value: products.filter(p => p.category === 'Miscellaneous').reduce((acc, p) => acc + (p.stock * p.price), 0),
      count: products.filter(p => p.category === 'Miscellaneous').length,
      color: '#f59e0b' // Amber
    }
  ];

  // Stock Units per category for Bar Chart
  const categoryStockData = [
    {
      category: 'Clothing',
      units: products.filter(p => p.category === 'Clothing').reduce((acc, p) => acc + p.stock, 0),
      val: products.filter(p => p.category === 'Clothing').reduce((acc, p) => acc + (p.stock * p.cost), 0),
    },
    {
      category: 'Groceries',
      units: products.filter(p => p.category === 'Groceries').reduce((acc, p) => acc + p.stock, 0),
      val: products.filter(p => p.category === 'Groceries').reduce((acc, p) => acc + (p.stock * p.cost), 0),
    },
    {
      category: 'Miscellaneous',
      units: products.filter(p => p.category === 'Miscellaneous').reduce((acc, p) => acc + p.stock, 0),
      val: products.filter(p => p.category === 'Miscellaneous').reduce((acc, p) => acc + (p.stock * p.cost), 0),
    }
  ];

  const handleFilterCategory = (cat) => {
    if (setSelectedCategoryFilter) {
      setSelectedCategoryFilter(cat);
    }
    setActiveTab('products');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Metrics Top Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Stock Value */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stock Value</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
              ${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
            </span>
            <span>asset valuation</span>
          </p>
        </div>

        {/* Metric 2: Potential Revenue */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potential Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
              ${totalPotentialRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Est. Profit:</span>
            <span className="text-slate-300 font-semibold">
              ${(totalPotentialRevenue - totalStockValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-900/40 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-amber-400 tracking-tight">
              {lowStockItems.length} <span className="text-xs text-slate-400 font-normal">items</span>
            </h3>
            {outOfStockItems.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                {outOfStockItems.length} Empty
              </span>
            )}
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="text-xs text-amber-300 hover:text-amber-200 mt-2 font-medium flex items-center gap-1 group-hover:underline"
          >
            <span>Review threshold items</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: Total Stock Quantity */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Inventory Units</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
              {totalItemsCount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">units</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across <span className="text-slate-200 font-semibold">{products.length} unique SKUs</span>
          </p>
        </div>
      </div>

      {/* Middle Section: Category Revenue Pie Chart & Category Stock Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Pie Chart Card */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-400" />
                Category Valuation Breakdown
              </h3>
              <p className="text-xs text-slate-400">Inventory dollar potential per category</p>
            </div>
            <span className="text-[11px] font-mono bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
              3 Categories
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-xs text-slate-300 font-medium px-2">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Category Quick Pills */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 mt-2">
            {categoryData.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleFilterCategory(cat.name)}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                </div>
                <p className="text-xs text-slate-400">
                  ${cat.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Category Stock Quantity Bar Chart */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Physical Stock Units Volume
              </h3>
              <p className="text-xs text-slate-400">Current available unit count per category</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${val} Units`, 'Quantity']}
                />
                <Bar dataKey="units" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Highest volume: <strong className="text-indigo-300">Groceries</strong></span>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Open Full Product List <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Low Stock Urgency Table & Category Overview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Low Stock Reorder Radar</h3>
              <p className="text-xs text-slate-400">Products requiring immediate supplier replenishment</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('products')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Manage All Inventory
          </button>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
            <p className="text-sm text-slate-400">All inventory items are currently above safety thresholds!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/40">
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min Threshold</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300 font-medium">{item.sku}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.category === 'Clothing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        item.category === 'Groceries' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${item.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                        {item.stock} {item.unit || 'pcs'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.minStock} {item.unit || 'pcs'}</td>
                    <td className="py-3 px-4 text-slate-400">{item.supplier}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onRestockItem(item.id, 20)}
                        className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-medium transition-all flex items-center gap-1 ml-auto"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>+20 Restock</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
