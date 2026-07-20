import React from 'react';
import { 
  LayoutDashboard, 
  PackageSearch, 
  PackagePlus, 
  ShoppingCart, 
  Layers, 
  Zap,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Store
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, lowStockCount, cartCount }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Overview & Analytics'
    },
    {
      id: 'products',
      label: 'Product Catalog',
      icon: PackageSearch,
      badge: null,
      desc: 'Filtered Stock View'
    },
    {
      id: 'add-product',
      label: 'Stock Manager',
      icon: PackagePlus,
      badge: null,
      desc: 'Add & Barcode Scan'
    },
    {
      id: 'pos',
      label: 'POS & Invoicing',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
      badgeColor: 'bg-emerald-500',
      desc: 'Checkout & Receipt'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen sticky top-0 backdrop-blur-md z-30 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-slate-100 tracking-wide text-base">NEXUS</h1>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              RETAIL v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400">Inventory & POS System</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Main Navigation</span>
          <Layers className="w-3.5 h-3.5" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium block leading-tight">{item.label}</span>
                  <span
                    className={`text-[11px] block ${
                      isActive ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                    item.badgeColor || 'bg-indigo-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Low Stock Quick Alert Box */}
      <div className="p-3 m-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Stock Alerts</h4>
            <p className="text-[11px] text-amber-400 font-medium">{lowStockCount} items below threshold</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('products')}
          className="w-full text-xs py-1.5 px-3 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-between font-medium"
        >
          <span>View Low Stock</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono text-[11px] text-slate-300">SYSTEM ONLINE</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Zap className="w-3 h-3 text-indigo-400" />
          <span>Sync v2</span>
        </div>
      </div>
    </aside>
  );
}
