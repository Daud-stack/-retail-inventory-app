import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  KeyRound, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  ShieldCheck, 
  Layers, 
  FileText, 
  ChevronDown, 
  LogOut, 
  Bell, 
  Key, 
  Database, 
  Server, 
  TrendingUp,
  LayoutDashboard,
  Store,
  Shield,
  Zap,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  CartesianGrid 
} from 'recharts';

import { 
  MOCK_TENANTS, 
  MOCK_LICENSES, 
  MOCK_SYSTEM_ALERTS, 
  MOCK_GLOBAL_CONFIG, 
  MOCK_SYSTEM_HEALTH, 
  MOCK_STORE_BAR_DATA, 
  MOCK_LICENSE_DONUT_DATA 
} from '../data/mockSuperAdminData';

import { 
  generateLicenseKey, 
  decodeLicenseKey, 
  LICENSE_TIERS, 
  TIER_CAPABILITIES 
} from '../services/licensingEngine';

export default function SuperAdminCommandCenter({ 
  currentUser, 
  onSwitchUser, 
  setActiveTab: setParentActiveTab 
}) {
  // Navigation & Sub-Tab states
  const [sidebarNav, setSidebarNav] = useState('command-center');
  const [topTab, setTopTab] = useState('overview'); // overview, stores, licenses, config, health
  
  // Data States
  const [tenants, setTenants] = useState(MOCK_TENANTS);
  const [licenses, setLicenses] = useState(MOCK_LICENSES);
  const [selectedTenantFilter, setSelectedTenantFilter] = useState('all');
  const [globalConfig, setGlobalConfig] = useState(MOCK_GLOBAL_CONFIG);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form States
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreLocation, setNewStoreLocation] = useState('');
  const [newStoreManager, setNewStoreManager] = useState('');
  const [newStoreMaxUsers, setNewStoreMaxUsers] = useState(15);

  // License Desk Form & Inspector States
  const [inspectorKey, setInspectorKey] = useState('');
  const [inspectedKeyData, setInspectedKeyData] = useState(null);
  const [isGenLicenseOpen, setIsGenLicenseOpen] = useState(false);
  const [genTenantId, setGenTenantId] = useState('');
  const [genPlan, setGenPlan] = useState(LICENSE_TIERS.FULL);
  const [genSeats, setGenSeats] = useState(15);
  const [genDuration, setGenDuration] = useState(12);

  // Action: Handle manual sync/refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Action: Inspect & Decode Key
  const handleInspectKey = (e) => {
    e.preventDefault();
    if (!inspectorKey.trim()) return;
    const res = decodeLicenseKey(inspectorKey);
    setInspectedKeyData(res);
  };

  // Action: Create Structured License Key
  const handleGenerateLicenseSubmit = (e) => {
    e.preventDefault();
    const selectedTenant = tenants.find(t => t.id === genTenantId) || tenants[0];
    const newLicObj = generateLicenseKey(genPlan, genDuration, genSeats);

    const fullLic = {
      id: `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
      key: newLicObj.key,
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      plan: newLicObj.plan,
      seats: newLicObj.seats,
      maxUsers: newLicObj.seats,
      monthlyPrice: TIER_CAPABILITIES[newLicObj.plan]?.priceMonthly || 0,
      issuedDate: newLicObj.issuedDate,
      expiryDate: newLicObj.expiryDate,
      daysLeft: newLicObj.daysLeft,
      status: 'Active',
      autoRenew: true,
      features: newLicObj.features
    };

    setLicenses([fullLic, ...licenses]);
    setIsGenLicenseOpen(false);
    alert(`Successfully generated License Key: ${fullLic.key}`);
  };

  // Action: Toggle Suspend / Reactivate License
  const handleToggleSuspendLicense = (licId) => {
    setLicenses(prev => prev.map(lic => {
      if (lic.id === licId) {
        const nextStatus = lic.status === 'Suspended' ? 'Active' : 'Suspended';
        return { ...lic, status: nextStatus };
      }
      return lic;
    }));
  };

  // Action: Upgrade License Plan Tier
  const handleUpgradeLicenseTier = (licId, newPlan) => {
    setLicenses(prev => prev.map(lic => {
      if (lic.id === licId) {
        const caps = TIER_CAPABILITIES[newPlan] || {};
        return { 
          ...lic, 
          plan: newPlan, 
          seats: caps.maxUsers || lic.seats, 
          maxUsers: caps.maxUsers || lic.maxUsers,
          monthlyPrice: caps.priceMonthly || lic.monthlyPrice,
          features: caps.features || lic.features 
        };
      }
      return lic;
    }));
  };

  // Action: Export License Certificate JSON
  const handleExportLicenseJson = (lic) => {
    const jsonStr = JSON.stringify(lic, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `License_${lic.id}_${lic.plan}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Action: Add new store tenant
  const handleCreateStore = (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    const newStore = {
      id: `tenant-${tenants.length + 1}`,
      name: newStoreName,
      code: `STR-00${tenants.length + 1}`,
      location: newStoreLocation || 'Main Hub',
      manager: newStoreManager || 'Store Manager',
      email: `${newStoreName.toLowerCase().replace(/\s+/g, '')}@nexusretail.com`,
      status: 'Active',
      plan: 'Starter',
      totalProducts: 0,
      totalStaff: 1,
      maxUsers: parseInt(newStoreMaxUsers) || 15,
      monthlyRevenue: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const newLicense = {
      id: `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
      tenantId: newStore.id,
      tenantName: newStore.name,
      plan: 'Starter',
      seats: parseInt(newStoreMaxUsers) || 15,
      maxUsers: parseInt(newStoreMaxUsers) || 15,
      issuedDate: newStore.createdDate,
      expiryDate: '2027-12-31',
      daysLeft: 365,
      status: 'Active',
      autoRenew: true
    };

    setTenants([newStore, ...tenants]);
    setLicenses([newLicense, ...licenses]);
    setNewStoreName('');
    setNewStoreLocation('');
    setNewStoreManager('');
    setIsAddStoreOpen(false);
  };

  // Action: Renew License
  const handleRenewLicense = (licId) => {
    setLicenses(prev => prev.map(lic => {
      if (lic.id === licId) {
        return { ...lic, status: 'Active', daysLeft: lic.daysLeft + 365, expiryDate: '2027-12-31' };
      }
      return lic;
    }));
  };

  // Filtered store dataset based on sidebar dropdown or tab selection
  const selectedTenant = tenants.find(t => t.id === selectedTenantFilter);
  const selectedTenantLicense = licenses.find(l => l.tenantId === selectedTenantFilter);

  const filteredTenants = selectedTenantFilter === 'all' 
    ? tenants 
    : tenants.filter(t => t.id === selectedTenantFilter);

  const filteredLicenses = selectedTenantFilter === 'all'
    ? licenses
    : licenses.filter(l => l.tenantId === selectedTenantFilter);

  // Derived Scoped KPIs & Scoped Chart Datasets
  const totalStores = selectedTenantFilter === 'all' ? tenants.length : 1;
  const totalProducts = selectedTenantFilter === 'all' 
    ? tenants.reduce((acc, t) => acc + t.totalProducts, 0) 
    : selectedTenant?.totalProducts || 0;
  const totalStaff = selectedTenantFilter === 'all' 
    ? tenants.reduce((acc, t) => acc + t.totalStaff, 0) 
    : selectedTenant?.totalStaff || 0;
  const activeLicenses = selectedTenantFilter === 'all' 
    ? licenses.filter(l => l.status === 'Active').length 
    : (selectedTenantLicense?.status === 'Active' ? 1 : 0);
  const expiringLicenses = selectedTenantFilter === 'all' 
    ? licenses.filter(l => l.daysLeft <= 30).length 
    : (selectedTenantLicense && selectedTenantLicense.daysLeft <= 30 ? 1 : 0);
  
  // Scoped Chart Data
  const storeBarData = selectedTenantFilter === 'all'
    ? MOCK_STORE_BAR_DATA
    : MOCK_STORE_BAR_DATA.filter(item => 
        item.name.toLowerCase().includes(selectedTenant?.name?.split(' ')[0].toLowerCase() || '')
      );

  const licenseDonutData = selectedTenantFilter === 'all'
    ? MOCK_LICENSE_DONUT_DATA
    : [
        { 
          name: selectedTenantLicense?.plan || selectedTenant?.plan || 'Full', 
          value: 1, 
          color: (selectedTenantLicense?.plan || selectedTenant?.plan) === 'Enterprise' ? '#10b981' :
                 (selectedTenantLicense?.plan || selectedTenant?.plan) === 'Full' ? '#2d7a64' :
                 (selectedTenantLicense?.plan || selectedTenant?.plan) === 'Starter' ? '#06b6d4' : '#f59e0b' 
        }
      ];

  const filteredAlerts = selectedTenantFilter === 'all'
    ? MOCK_SYSTEM_ALERTS
    : MOCK_SYSTEM_ALERTS.filter(a => 
        a.message.toLowerCase().includes(selectedTenant?.name?.split(' ')[0].toLowerCase() || '') ||
        a.title.toLowerCase().includes('license')
      );

  const activeAlerts = filteredAlerts.length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Slate Theme matching Mockup) */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full shrink-0 z-10">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/90 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md ring-1 ring-emerald-400/30">
              <Shield className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-100 text-base tracking-tight leading-none">NexusRetail</h1>
              <span className="text-[11px] font-mono font-semibold text-emerald-400">SUPER ADMIN v2.4</span>
            </div>
          </div>

          {/* TENANT SWITCHER DROPDOWN */}
          <div className="p-3.5 border-b border-slate-800/80">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              VIEWING STORE TENANT
            </label>
            <div className="relative">
              <select
                value={selectedTenantFilter}
                onChange={(e) => setSelectedTenantFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 appearance-none focus:outline-none focus:border-emerald-500 transition-all cursor-pointer pr-8"
              >
                <option value="all">Platform Overview (All Stores)</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Admin Controls
            </div>

            <button
              onClick={() => { setSidebarNav('command-center'); setTopTab('overview'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                sidebarNav === 'command-center' && topTab === 'overview'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => { setSidebarNav('system-admin'); setTopTab('stores'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                topTab === 'stores'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>System Administration</span>
            </button>

            <button
              onClick={() => { setSidebarNav('license-desk'); setTopTab('licenses'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                topTab === 'licenses'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <KeyRound className="w-4 h-4 text-slate-400" />
              <span>License Desk</span>
              {expiringLicenses > 0 && (
                <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {expiringLicenses}
                </span>
              )}
            </button>

            <button
              onClick={() => { setSidebarNav('system-alerts'); setTopTab('health'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                topTab === 'health'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-slate-400" />
              <span>System Alerts</span>
            </button>

            <button
              onClick={() => { setSidebarNav('reporting'); setTopTab('overview'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                sidebarNav === 'reporting'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>Reporting & KPIs</span>
            </button>

            <button
              onClick={() => { setSidebarNav('audits'); setTopTab('config'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                topTab === 'config'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Platform Audits</span>
            </button>
          </nav>
        </div>

        {/* SIDEBAR FOOTER PROFILE BADGE */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
              SA
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-200 block truncate leading-tight">
                {currentUser?.name || 'superadmin'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-extrabold block">
                SUPER ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={() => setTopTab('health')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors relative"
              title="System Alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
            
            <button 
              onClick={() => setTopTab('licenses')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Licenses Desk"
            >
              <Key className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => setParentActiveTab && setParentActiveTab('dashboard')}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
              title="Exit Super Admin View"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW AREA (Dark Slate Canvas with Modern Visualizations) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-950">
        
        {/* TOP HEADER COMMAND CENTER TITLE BAR */}
        <header className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-serif font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              Super Admin Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Full platform control — tenants, licenses, inventory & system health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedTenantFilter !== 'all' && selectedTenant && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-fadeIn">
                <Building2 className="w-3.5 h-3.5" />
                <span>Viewing Tenant: {selectedTenant.name}</span>
                <button 
                  onClick={() => setSelectedTenantFilter('all')} 
                  className="ml-1 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                  title="Reset to All Stores Overview"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1">
          
          {/* ========================================================================= */}
          {/* 3. TOP NAVIGATION PILL TABS */}
          {/* ========================================================================= */}
          <div className="p-1 bg-slate-900/90 border border-slate-800/90 rounded-2xl inline-flex items-center gap-1 shadow-sm overflow-x-auto max-w-full">
            <button
              onClick={() => setTopTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                topTab === 'overview'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Platform Overview</span>
            </button>

            <button
              onClick={() => setTopTab('stores')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                topTab === 'stores'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Store Management</span>
            </button>

            <button
              onClick={() => setTopTab('licenses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                topTab === 'licenses'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Licenses & Billing</span>
            </button>

            <button
              onClick={() => setTopTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                topTab === 'config'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Global Config</span>
            </button>

            <button
              onClick={() => setTopTab('health')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                topTab === 'health'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>System Health</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB CONTENT: PLATFORM OVERVIEW (Matching Design Layout) */}
          {/* ========================================================================= */}
          {topTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* KPI CARDS GRID (6 SUMMARY CARDS MATCHING MOCKUP) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                
                {/* 1. STORES */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">STORES</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-100 font-mono">{totalStores}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                </div>

                {/* 2. TOTAL PRODUCTS */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TOTAL PRODUCTS</span>
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-100 font-mono">{totalProducts}</span>
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Items</span>
                  </div>
                </div>

                {/* 3. STAFF MEMBERS */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">STAFF MEMBERS</span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-100 font-mono">{totalStaff}</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Users</span>
                  </div>
                </div>

                {/* 4. ACTIVE LICENSES */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">ACTIVE LICENSES</span>
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <KeyRound className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-100 font-mono">{activeLicenses}</span>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Valid</span>
                  </div>
                </div>

                {/* 5. EXPIRING <= 30D */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">EXPIRING ≤30D</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-100 font-mono">{expiringLicenses}</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Action</span>
                  </div>
                </div>

                {/* 6. ACTIVE ALERTS */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">ACTIVE ALERTS</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-100 font-mono">{activeAlerts}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">System OK</span>
                  </div>
                </div>

              </div>

              {/* VISUALIZATION CHARTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* BAR CHART: Products / Revenue per Store */}
                <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Products per Store</h3>
                      <p className="text-[11px] text-slate-400">Active product catalog distribution across store locations</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      Live Store Sync
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={storeBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="storeBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2d7a64" stopOpacity={1} />
                            <stop offset="100%" stopColor="#1e5243" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '12px'
                          }} 
                        />
                        <Bar dataKey="students" fill="url(#storeBarGradient)" radius={[8, 8, 0, 0]} barSize={42} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* DONUT CHART: License Plan Breakdown */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">License Plan Breakdown</h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedTenantFilter === 'all' ? 'Distribution of active tenant licensing tiers' : `Selected Store Plan (${selectedTenant?.name})`}
                    </p>
                  </div>

                  <div className="h-56 w-full flex items-center justify-center my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={licenseDonutData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {licenseDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '12px'
                          }} 
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          iconType="circle"
                          formatter={(value) => <span className="text-xs text-slate-300 font-semibold">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Total Subscriptions</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {selectedTenantFilter === 'all' ? `${licenses.length} Plans` : '1 Store Plan'}
                    </span>
                  </div>
                </div>

              </div>

              {/* PLATFORM RECENT ALERTS FEED */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Platform Alerts & Audits</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{filteredAlerts.length} Logs Captured</span>
                </div>

                <div className="space-y-2.5">
                  {filteredAlerts.map(alert => (
                    <div key={alert.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.level === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                          alert.level === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{alert.title}</h4>
                          <p className="text-[11px] text-slate-400">{alert.message}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block">{alert.timestamp}</span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                          {alert.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT: STORE MANAGEMENT */}
          {/* ========================================================================= */}
          {topTab === 'stores' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Tenant Store Management</h3>
                  <p className="text-xs text-slate-400">View and provision store locations across the retail platform</p>
                </div>

                <button
                  onClick={() => setIsAddStoreOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision New Store</span>
                </button>
              </div>

              {/* SINGLE STORE SPOTLIGHT CARD (When specific tenant selected) */}
              {selectedTenantFilter !== 'all' && selectedTenant && (
                <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-lg animate-fadeIn space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                          {selectedTenant.name}
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {selectedTenant.status}
                          </span>
                        </h4>
                        <span className="text-xs font-mono text-slate-400">Code: {selectedTenant.code} • Location: {selectedTenant.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTopTab('licenses')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        Manage SaaS License
                      </button>
                      <button
                        onClick={() => setSelectedTenantFilter('all')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
                      >
                        View All Stores
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">STORE MANAGER</span>
                      <strong className="text-slate-200 text-sm">{selectedTenant.manager}</strong>
                      <span className="text-[10px] text-slate-500 block truncate">{selectedTenant.email}</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">PLAN TIER</span>
                      <strong className="text-indigo-400 text-sm uppercase">{selectedTenant.plan}</strong>
                      <span className="text-[10px] text-slate-500 block">{selectedTenantLicense?.key || 'Active License'}</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">USER SEAT QUOTA</span>
                      <strong className="text-emerald-400 text-sm">{selectedTenant.totalStaff} / {selectedTenant.maxUsers} Users</strong>
                      <span className="text-[10px] text-slate-500 block">
                        {Math.round((selectedTenant.totalStaff / selectedTenant.maxUsers) * 100)}% Capacity
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">MONTHLY REVENUE</span>
                      <strong className="text-teal-400 text-sm">${selectedTenant.monthlyRevenue?.toLocaleString()}</strong>
                      <span className="text-[10px] text-slate-500 block">Created: {selectedTenant.createdDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STORE MANAGEMENT TABLE */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Store / Tenant Name</th>
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Manager</th>
                      <th className="p-3.5">Plan Tier</th>
                      <th className="p-3.5">Products</th>
                      <th className="p-3.5">Max User Quota</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredTenants.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span>{t.name}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{t.code}</td>
                        <td className="p-3.5 text-slate-300">{t.location}</td>
                        <td className="p-3.5 font-medium text-slate-200">{t.manager}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {t.plan}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{t.totalProducts}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-200 font-bold">{t.totalStaff} / {t.maxUsers} Users</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              t.totalStaff >= t.maxUsers ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {Math.round((t.totalStaff / t.maxUsers) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT: LICENSES & BILLING */}
          {/* ========================================================================= */}
          {topTab === 'licenses' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    <span>SaaS License Desk & Key Generator</span>
                  </h3>
                  <p className="text-xs text-slate-400">Cryptographic key generation, feature gating, seat quotas, and subscription renewal</p>
                </div>

                <button
                  onClick={() => setIsGenLicenseOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate New License Key</span>
                </button>
              </div>

              {/* SUMMARY STATS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TOTAL MONTHLY MRR</span>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                    ${licenses.reduce((acc, l) => acc + (l.monthlyPrice || 0), 0)} <span className="text-xs text-slate-400 font-sans">/mo</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 block">Recurring License Revenue</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">ACTIVE SUBSCRIPTIONS</span>
                  <div className="text-2xl font-extrabold text-slate-100 font-mono mt-1">
                    {licenses.filter(l => l.status === 'Active').length} <span className="text-xs text-slate-400 font-sans">/ {licenses.length}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 mt-1 block">Active Tenant Keys</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TOTAL ALLOCATED SEATS</span>
                  <div className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">
                    {licenses.reduce((acc, l) => acc + (l.seats || 0), 0)} <span className="text-xs text-slate-400 font-sans">Seats</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 block">Cross-Store User Quota</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">EXPIRING ≤30D</span>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                    {licenses.filter(l => l.daysLeft <= 30).length} <span className="text-xs text-slate-400 font-sans">Keys</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400 mt-1 block">Requires Renewal Action</span>
                </div>
              </div>

              {/* LICENSE KEY INSPECTOR & DECODER TOOL */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>Live License Key Inspector & Validator</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Format: NEXUS-{'{TIER}'}-{'{YEAR}'}-{'{HASH}'}</span>
                </div>

                <form onSubmit={handleInspectKey} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste License Key (e.g., NEXUS-ENT-2026-X89A-94B2)..."
                    value={inspectorKey}
                    onChange={(e) => setInspectorKey(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-bold transition-all shrink-0"
                  >
                    Inspect & Decode Key
                  </button>
                </form>

                {inspectedKeyData && (
                  <div className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
                    inspectedKeyData.valid 
                      ? 'bg-slate-950/80 border-emerald-500/40 text-slate-200' 
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}>
                    {inspectedKeyData.valid ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-emerald-400 font-bold text-sm">{inspectedKeyData.key}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            VALID KEY • {inspectedKeyData.plan}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-t border-b border-slate-800 my-2 font-mono">
                          <div><span className="text-slate-400 block text-[10px]">TIER</span> <strong className="text-slate-100">{inspectedKeyData.plan}</strong></div>
                          <div><span className="text-slate-400 block text-[10px]">MAX USERS</span> <strong className="text-slate-100">{inspectedKeyData.maxUsers} Users</strong></div>
                          <div><span className="text-slate-400 block text-[10px]">PRICE</span> <strong className="text-slate-100">${inspectedKeyData.monthlyPrice}/mo</strong></div>
                          <div><span className="text-slate-400 block text-[10px]">YEAR</span> <strong className="text-slate-100">{inspectedKeyData.year}</strong></div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Permitted Features:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {inspectedKeyData.features?.map(feat => (
                              <span key={feat} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="font-semibold">⚠️ Validation Error: {inspectedKeyData.error}</div>
                    )}
                  </div>
                )}
              </div>

              {/* LICENSES TABLE */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Structured License Key</th>
                      <th className="p-3.5">Tenant Name</th>
                      <th className="p-3.5">Plan Tier</th>
                      <th className="p-3.5">User Quota</th>
                      <th className="p-3.5">MRR</th>
                      <th className="p-3.5">Expiry Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {licenses.map(lic => (
                      <tr key={lic.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-emerald-400 font-bold flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{lic.key || lic.id}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-200">{lic.tenantName}</td>
                        <td className="p-3.5">
                          <select
                            value={lic.plan}
                            onChange={(e) => handleUpgradeLicenseTier(lic.id, e.target.value)}
                            className="bg-slate-800 text-slate-200 text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value={LICENSE_TIERS.TRIAL}>Trial (3 Users)</option>
                            <option value={LICENSE_TIERS.STARTER}>Starter (5 Users)</option>
                            <option value={LICENSE_TIERS.FULL}>Full (15 Users)</option>
                            <option value={LICENSE_TIERS.ENTERPRISE}>Enterprise (50 Users)</option>
                          </select>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-200">{lic.seats} Users</td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">${lic.monthlyPrice || 0}/mo</td>
                        <td className="p-3.5 font-mono text-slate-400">{lic.expiryDate}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            lic.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            lic.status === 'Suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {lic.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRenewLicense(lic.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px] font-bold transition-all border border-emerald-500/30"
                              title="Extend subscription by 12 months"
                            >
                              Renew
                            </button>

                            <button
                              onClick={() => handleToggleSuspendLicense(lic.id)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                lic.status === 'Suspended'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-600 hover:text-white'
                              }`}
                              title={lic.status === 'Suspended' ? 'Reactivate License' : 'Freeze & Suspend Tenant'}
                            >
                              {lic.status === 'Suspended' ? 'Reactivate' : 'Freeze'}
                            </button>

                            <button
                              onClick={() => handleExportLicenseJson(lic)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all border border-slate-700"
                              title="Export License Certificate JSON"
                            >
                              JSON
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT: GLOBAL CONFIG */}
          {/* ========================================================================= */}
          {topTab === 'config' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div>
                <h3 className="text-base font-bold text-slate-100">Global Platform Configuration</h3>
                <p className="text-xs text-slate-400">System-wide parameters, tax defaults, and infrastructure flags</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Platform Brand Title</label>
                    <input 
                      type="text" 
                      value={globalConfig.platformName} 
                      onChange={(e) => setGlobalConfig({ ...globalConfig, platformName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Database Engine Target</label>
                    <input 
                      type="text" 
                      disabled
                      value={globalConfig.databaseEngine} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Default Currency Symbol</label>
                    <input 
                      type="text" 
                      value={globalConfig.defaultCurrency} 
                      onChange={(e) => setGlobalConfig({ ...globalConfig, defaultCurrency: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Default Sales Tax Rate (%)</label>
                    <input 
                      type="number" 
                      value={globalConfig.taxRateDefault} 
                      onChange={(e) => setGlobalConfig({ ...globalConfig, taxRateDefault: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Default Max Users Per Tenant</label>
                    <input 
                      type="number" 
                      value={globalConfig.maxUsersAllowedPerTenant} 
                      onChange={(e) => setGlobalConfig({ ...globalConfig, maxUsersAllowedPerTenant: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Global System Users Limit</label>
                    <input 
                      type="number" 
                      value={globalConfig.maxGlobalUsersLimit} 
                      onChange={(e) => setGlobalConfig({ ...globalConfig, maxGlobalUsersLimit: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Offline POS Mode</h4>
                      <p className="text-[11px] text-slate-400">Allow local caching and offline checkout sync</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={globalConfig.enableOfflinePOS}
                      onChange={(e) => setGlobalConfig({ ...globalConfig, enableOfflinePOS: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Maintenance Mode</h4>
                      <p className="text-[11px] text-slate-400">Restrict access for non-super-admin store managers</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={globalConfig.maintenanceMode}
                      onChange={(e) => setGlobalConfig({ ...globalConfig, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button 
                    onClick={() => alert('Global configuration settings saved successfully!')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT: SYSTEM HEALTH */}
          {/* ========================================================================= */}
          {topTab === 'health' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div>
                <h3 className="text-base font-bold text-slate-100">Infrastructure & DB System Health</h3>
                <p className="text-xs text-slate-400">Real-time status of Neon PostgreSQL, server memory & API latency</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">DB LATENCY</span>
                    <Database className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 font-mono">
                    {MOCK_SYSTEM_HEALTH.dbLatencyMs} <span className="text-xs font-sans text-slate-400">ms</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                    Neon Serverless OK
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">API UPTIME</span>
                    <Server className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 font-mono">
                    {MOCK_SYSTEM_HEALTH.apiUptimePercentage}%
                  </div>
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                    99.98% SLA
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">ACTIVE WEBSOCKETS</span>
                    <Activity className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 font-mono">
                    {MOCK_SYSTEM_HEALTH.activeWebsockets}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                    Live POS Sockets
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">MEMORY LOAD</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 font-mono">
                    {MOCK_SYSTEM_HEALTH.memoryUsageMb} <span className="text-xs font-sans text-slate-400">MB</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                    30.5% Allocated
                  </span>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: PROVISION NEW STORE */}
      {/* ========================================================================= */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Provision New Store Tenant</span>
              </h3>
              <button 
                onClick={() => setIsAddStoreOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store / Tenant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Masvingo Retail Branch"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g., Masvingo Central Mall"
                  value={newStoreLocation}
                  onChange={(e) => setNewStoreLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store Manager Name</label>
                <input
                  type="text"
                  placeholder="e.g., Tendai Moyo"
                  value={newStoreManager}
                  onChange={(e) => setNewStoreManager(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Maximum User Quota Limit</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  placeholder="15"
                  value={newStoreMaxUsers}
                  onChange={(e) => setNewStoreMaxUsers(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Create & Issue License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: GENERATE NEW LICENSE KEY */}
      {/* ========================================================================= */}
      {isGenLicenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Generate Cryptographic License Key</span>
              </h3>
              <button 
                onClick={() => setIsGenLicenseOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateLicenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Store Tenant</label>
                <select
                  value={genTenantId}
                  onChange={(e) => setGenTenantId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Tenant Store...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Licensing Tier</label>
                  <select
                    value={genPlan}
                    onChange={(e) => setGenPlan(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                  >
                    <option value={LICENSE_TIERS.TRIAL}>Trial (Max 3 Users)</option>
                    <option value={LICENSE_TIERS.STARTER}>Starter ($49/mo • 5 Users)</option>
                    <option value={LICENSE_TIERS.FULL}>Full ($149/mo • 15 Users)</option>
                    <option value={LICENSE_TIERS.ENTERPRISE}>Enterprise ($399/mo • 50 Users)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">User Seat Quota</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={genSeats}
                    onChange={(e) => setGenSeats(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subscription Duration (Months)</label>
                <select
                  value={genDuration}
                  onChange={(e) => setGenDuration(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value={1}>1 Month (Monthly)</option>
                  <option value={3}>3 Months (Quarterly)</option>
                  <option value={6}>6 Months (Semi-Annual)</option>
                  <option value={12}>12 Months (Annual - 1 Year)</option>
                  <option value={24}>24 Months (Multi-Year - 2 Years)</option>
                </select>
              </div>

              {/* TIER PREVIEW BOX */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] space-y-1">
                <span className="font-bold text-slate-300 uppercase tracking-wider block text-[10px]">Tier Preview ({genPlan}):</span>
                <p className="text-slate-400">{TIER_CAPABILITIES[genPlan]?.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {TIER_CAPABILITIES[genPlan]?.features.map(f => (
                    <span key={f} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono border border-emerald-500/20">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenLicenseOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Generate & Activate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
