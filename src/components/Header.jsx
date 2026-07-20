import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ScanLine, 
  Bell, 
  ShoppingCart, 
  Clock, 
  Sparkles,
  Shirt,
  ShoppingBag,
  Box,
  Plus
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  lowStockCount, 
  cartCount,
  onOpenScanner
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabTitles = {
    dashboard: { title: 'Store Dashboard & Metrics', subtitle: 'Real-time inventory valuation & category breakdown' },
    products: { title: 'Product Inventory List', subtitle: 'Filter across Clothing, Groceries & Miscellaneous' },
    'add-product': { title: 'Stock Entry & Update', subtitle: 'Add new products or scan barcode SKU' },
    pos: { title: 'POS Invoicing & Checkout', subtitle: 'Build cart list, calculate taxes & print receipt' }
  };

  const currentInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left Title & Subtitle */}
      <div>
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {currentInfo.title}
        </h2>
        <p className="text-xs text-slate-400">{currentInfo.subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Quick Search Input */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Scan Barcode Quick Action */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all group hover:border-indigo-500/50"
        >
          <ScanLine className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Scan SKU</span>
        </button>

        {/* Quick Add Product Button */}
        <button
          onClick={() => setActiveTab('add-product')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Stock</span>
        </button>

        {/* POS Cart Direct Link */}
        <button
          onClick={() => setActiveTab('pos')}
          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          title="Open POS Checkout"
        >
          <ShoppingCart className="w-4 h-4 text-slate-300" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-bounce">
              {cartCount}
            </span>
          )}
        </button>

        {/* Live Clock Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-indigo-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || '14:00:00'}</span>
        </div>
      </div>
    </header>
  );
}
