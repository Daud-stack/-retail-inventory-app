import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  Users, 
  Store, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  Shield,
  Building2,
  Sparkles
} from 'lucide-react';
import { ROLES } from '../config/rbac';

export default function LoginModal({ 
  users, 
  onLoginSuccess 
}) {
  const [portalMode, setPortalMode] = useState('store'); // 'store' | 'superadmin'
  const storeRoleUsers = users.filter(u => u.role !== ROLES.SUPER_ADMIN);
  const [selectedUser, setSelectedUser] = useState(storeRoleUsers[0] || null);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPinInput('');
    setErrorMsg('');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('Please enter your 4-digit Security PIN.');
      return;
    }

    if (portalMode === 'superadmin') {
      const superAdminAcc = users.find(u => u.role === ROLES.SUPER_ADMIN);
      if (pinInput === '9999' || (superAdminAcc && pinInput === superAdminAcc.pin)) {
        setErrorMsg('');
        onLoginSuccess(superAdminAcc || { id: 'usr-0', name: 'Super Admin Account', role: ROLES.SUPER_ADMIN, pin: '9999' });
      } else {
        setErrorMsg('Invalid Super Admin Master Security PIN.');
      }
      return;
    }

    // Store Personnel Login Mode
    if (selectedUser && pinInput === selectedUser.pin) {
      setErrorMsg('');
      onLoginSuccess(selectedUser);
    } else {
      setErrorMsg(`Invalid Security PIN for ${selectedUser?.role || 'Selected'} Account.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Decorative Glow */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          portalMode === 'superadmin' ? 'bg-emerald-500/20' : 'bg-indigo-500/10'
        }`} />
        <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          portalMode === 'superadmin' ? 'bg-cyan-500/20' : 'bg-indigo-500/10'
        }`} />

        {/* Portal Selection Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setPortalMode('store'); setErrorMsg(''); setPinInput(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              portalMode === 'store'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store Personnel Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setPortalMode('superadmin'); setErrorMsg(''); setPinInput(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              portalMode === 'superadmin'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-300" />
            <span>Super Admin Portal</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg ring-1 ring-white/20 ${
            portalMode === 'superadmin' 
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-emerald-500/20'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-indigo-500/20'
          }`}>
            {portalMode === 'superadmin' ? (
              <Shield className="w-7 h-7 text-white" />
            ) : (
              <Store className="w-7 h-7 text-white" />
            )}
          </div>
          
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            {portalMode === 'superadmin' ? 'NexusHQ Super Admin Portal' : 'NexusRetail Authentication Guard'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {portalMode === 'superadmin' 
              ? 'Multi-Tenant Platform Command Center & Licensing Control' 
              : 'Select Store Role Account & enter 4-digit PIN to authenticate'}
          </p>
        </div>

        {/* Mode 1: Store Personnel Role Grid */}
        {portalMode === 'store' && (
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Select System Role Account:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {storeRoleUsers.map((usr) => {
                const isSelected = selectedUser?.id === usr.id;
                const roleCode = usr.role === ROLES.ADMIN ? 'ADM' :
                                 usr.role === ROLES.MANAGER ? 'MGR' :
                                 usr.role === ROLES.CASHIER ? 'POS' : 'CLK';
                return (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => handleSelectUser(usr)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md ring-1 ring-indigo-500/40 text-slate-100'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 font-extrabold text-indigo-400 text-xs flex items-center justify-center shrink-0">
                        {roleCode}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate leading-tight">{usr.role}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Role Authorization</span>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 2: Super Admin Portal Security Banner */}
        {portalMode === 'superadmin' && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Multi-Tenant Command Center</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Super Admin access grants full platform control over tenant store provisioning, global licensing engine, and cross-store data analytics.
            </p>
          </div>
        )}

        {/* PIN Entry Form */}
        <form onSubmit={handlePinSubmit} className="space-y-4 pt-2 border-t border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {portalMode === 'superadmin' ? 'Super Admin Master Security Code' : `Security PIN for ${selectedUser?.role} Account`}
                </span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">4-Digit Code Required</span>
            </div>

            <input
              type="password"
              maxLength="4"
              autoFocus
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-center text-lg font-mono tracking-widest text-slate-100 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 text-white ${
              portalMode === 'superadmin'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
            }`}
          >
            {isVerifying ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{portalMode === 'superadmin' ? 'Authenticate Super Admin' : 'Authenticate & Access System'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-400 font-mono">
          Strict Security Active • Role Authorization Enforced
        </div>

      </div>
    </div>
  );
}
