import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ScanLine, 
  ShoppingCart, 
  Clock, 
  Menu,
  ShieldCheck
} from 'lucide-react';
import { ROLES } from '../config/rbac';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  cartCount,
  currentUser,
  onOpenUserManagement,
  onOpenScanner,
  onOpenMobileMenu,
  onOpenQuickCart
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
    dashboard: { title: 'Dashboard', subtitle: 'Metrics & Category Valuation' },
    products: { title: 'Product Catalog', subtitle: 'Filter Clothing, Groceries & Misc' },
    'add-product': { title: 'Stock Entry', subtitle: 'Add Item or Scan Barcode SKU' },
    forecasting: { title: 'Stock Demand Forecasting', subtitle: 'Time Series Predictions & Stockout Timelines' },
    datascience: { title: 'Retail Intelligence & Data Science', subtitle: 'Market Basket Analysis (Apriori), FSN Velocity & ABC Pareto Rules' },
    pos: { title: 'POS Checkout', subtitle: 'Cart List, Taxes & PDF Receipt' },
    superadmin: { title: 'Super Admin Command Center', subtitle: 'Full Platform Control — Stores, Licenses & System Health' }
  };

  const currentInfo = tabTitles[activeTab] || tabTitles.dashboard;

  const handleCartClick = () => {
    if (onOpenQuickCart) {
      onOpenQuickCart();
    } else {
      setActiveTab('pos');
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 select-none">
      {/* Left: Mobile Menu Button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title="Open Mobile Navigation Menu"
        >
          <Menu className="w-5 h-5 text-indigo-400" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            {currentInfo.title}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Right Controls & Active User RBAC Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Quick Search */}
        <div className="relative w-36 sm:w-56 hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* ACTIVE USER RBAC PROFILE SWITCHER BUTTON */}
        <button
          onClick={onOpenUserManagement}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-xs font-semibold group"
          title="Manage Roles & Switch User Profile"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
            {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-[11px] font-bold text-slate-200 block leading-tight">{currentUser?.name}</span>
            <span className={`text-[9px] font-extrabold uppercase px-1 rounded ${
              currentUser?.role === ROLES.SUPER_ADMIN ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              currentUser?.role === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-300' :
              currentUser?.role === ROLES.MANAGER ? 'bg-indigo-500/20 text-indigo-300' :
              currentUser?.role === ROLES.CASHIER ? 'bg-emerald-500/20 text-emerald-300' :
              'bg-amber-500/20 text-amber-300'
            }`}>
              {currentUser?.role || 'User'}
            </span>
          </div>
          <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Scan Barcode Quick Action */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all group"
        >
          <ScanLine className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Scan SKU</span>
        </button>

        {/* POS Cart Direct Link */}
        <button
          onClick={handleCartClick}
          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:scale-105 active:scale-95"
          title="Open Quick Cart Drawer"
        >
          <ShoppingCart className="w-4 h-4 text-slate-300" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-bounce shadow-md">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
