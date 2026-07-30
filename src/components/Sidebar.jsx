import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PackageSearch, 
  PackagePlus, 
  ShoppingCart, 
  TrendingUp,
  BrainCircuit,
  Users,
  Layers, 
  Zap,
  AlertTriangle,
  ChevronRight,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Shield,
  FileText,
  ShieldCheck,
  ClipboardList,
  UserCheck,
  Truck,
  Database
} from 'lucide-react';
import { ROLES, PERMISSIONS, hasPermission } from '../config/rbac';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  lowStockCount, 
  cartCount,
  isMobileOpen,
  onCloseMobileMenu,
  currentUser
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Permission-based item filtering
  const itemsWithPermissions = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Overview & Analytics',
      permission: PERMISSIONS.VIEW_DASHBOARD
    },
    {
      id: 'products',
      label: 'Product Catalog',
      icon: PackageSearch,
      desc: 'Filtered Stock View',
      permission: PERMISSIONS.VIEW_PRODUCTS
    },
    {
      id: 'add-product',
      label: 'Stock Manager',
      icon: PackagePlus,
      desc: 'Add & Barcode Scan',
      permission: PERMISSIONS.ADD_PRODUCT
    },
    {
      id: 'forecasting',
      label: 'Stock Forecasting',
      icon: TrendingUp,
      desc: 'Time Series Predictions',
      permission: PERMISSIONS.VIEW_DASHBOARD
    },
    {
      id: 'datascience',
      label: 'Retail Intelligence',
      icon: BrainCircuit,
      desc: 'Market Basket & FSN',
      permission: PERMISSIONS.VIEW_FINANCIALS
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      desc: 'Roles & Credentials',
      permission: PERMISSIONS.MANAGE_USERS
    },
    {
      id: 'pos',
      label: 'POS & Invoicing',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
      badgeColor: 'bg-emerald-500',
      desc: 'Checkout & Receipt',
      permission: PERMISSIONS.EXECUTE_POS
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: FileText,
      desc: 'Sales, Tax & Inventory',
      permission: PERMISSIONS.VIEW_FINANCIALS
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail',
      icon: ClipboardList,
      desc: 'Security Event Logs',
      permission: PERMISSIONS.VIEW_AUDIT_LOGS
    },
    {
      id: 'customers',
      label: 'Customers & Loyalty',
      icon: UserCheck,
      desc: 'Profiles & Points',
      permission: PERMISSIONS.MANAGE_CUSTOMERS
    },
    {
      id: 'suppliers',
      label: 'Suppliers & Orders',
      icon: Truck,
      desc: 'Vendor PO Tracking',
      permission: PERMISSIONS.MANAGE_SUPPLIERS
    },
    {
      id: 'data-center',
      label: 'Data & Backups',
      icon: Database,
      desc: 'CSV Import & JSON Backup',
      permission: PERMISSIONS.MANAGE_DATA
    }
  ];

  const userRole = currentUser?.role || ROLES.CASHIER;

  const filteredBaseNav = itemsWithPermissions.filter(item => 
    hasPermission(userRole, item.permission)
  );

  const superAdminItem = {
    id: 'superadmin',
    label: 'Super Admin',
    icon: Shield,
    badge: 'HQ',
    badgeColor: 'bg-emerald-500',
    desc: 'Multi-Tenant Control'
  };

  // Only include Super Admin item if user has Super Admin permission
  const navItems = hasPermission(userRole, PERMISSIONS.VIEW_SUPER_ADMIN)
    ? [superAdminItem, ...filteredBaseNav]
    : filteredBaseNav;

  const handleTabClick = (tabId) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setActiveTab(tabId);
      });
    } else {
      setActiveTab(tabId);
    }
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const sidebarContent = (
    <aside 
      className={`bg-slate-900/95 border-r border-slate-800/80 flex flex-col h-full backdrop-blur-xl shrink-0 select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="truncate animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-slate-100 tracking-wide text-base">NEXUS</h1>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Inventory & POS System</p>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        {onCloseMobileMenu && (
          <button
            onClick={onCloseMobileMenu}
            className="md:hidden p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Main Navigation</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group text-left relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-medium scale-[1.01]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="truncate">
                    <span className="text-sm font-semibold block leading-tight">{item.label}</span>
                    <span
                      className={`text-[11px] block truncate ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                )}
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                    item.badgeColor || 'bg-indigo-500'
                  } ${isCollapsed ? 'absolute -top-1 -right-1 shadow-md animate-bounce' : ''}`}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-cyan-400 rounded-l-full shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Low Stock Quick Alert Box (Full View Only) */}
      {!isCollapsed && (
        <div className="p-3 m-3 bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 rounded-2xl shadow-md">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Stock Alerts</h4>
              <p className="text-[11px] text-amber-400 font-semibold">{lowStockCount} items low</p>
            </div>
          </div>
          <button
            onClick={() => handleTabClick('products')}
            className="w-full text-xs py-1.5 px-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-between font-semibold"
          >
            <span>Review Reorders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-3.5 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          {!isCollapsed && <span className="font-mono text-[11px] text-slate-300 font-semibold">NEON ONLINE</span>}
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>v2.4</span>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Slide-in Drawer Modal */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={onCloseMobileMenu}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-72 h-full bg-slate-900 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
