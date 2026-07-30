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
  ShieldAlert
} from 'lucide-react';
import { ROLES } from '../config/rbac';

export default function LoginModal({ 
  users, 
  onLoginSuccess 
}) {
  const [selectedUser, setSelectedUser] = useState(users[0] || null);
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
    if (!selectedUser) return;

    if (!pinInput.trim()) {
      setErrorMsg('Please enter your 4-digit Security PIN.');
      return;
    }

    if (pinInput === selectedUser.pin) {
      setErrorMsg('');
      onLoginSuccess(selectedUser);
    } else {
      setErrorMsg(`Invalid PIN for ${selectedUser.name}. Please check your 4-digit code.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            NexusRetail Authentication Guard
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Role-Based Access Control (RBAC) System • Enter PIN to log in
          </p>
        </div>

        {/* Profile Choice Grid */}
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Select User Account:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {users.map((usr) => {
              const isSelected = selectedUser?.id === usr.id;
              return (
                <button
                  key={usr.id}
                  type="button"
                  onClick={() => handleSelectUser(usr)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md ring-1 ring-indigo-500/40 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-extrabold text-indigo-400 text-xs flex items-center justify-center shrink-0">
                      {usr.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold block truncate leading-tight">{usr.name}</span>
                      <span className={`text-[9px] font-extrabold uppercase px-1 rounded inline-block mt-0.5 ${
                        usr.role === ROLES.SUPER_ADMIN ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        usr.role === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-300' :
                        usr.role === ROLES.MANAGER ? 'bg-indigo-500/20 text-indigo-300' :
                        usr.role === ROLES.CASHIER ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {usr.role}
                      </span>
                    </div>
                  </div>

                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handlePinSubmit} className="space-y-4 pt-2 border-t border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Security PIN for {selectedUser?.name}</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">PIN: {selectedUser?.pin}</span>
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
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {isVerifying ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Authenticate & Access System</span>
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
