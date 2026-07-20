import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  X, 
  Check, 
  Key, 
  Lock, 
  UserCheck, 
  AlertCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ROLES, ROLE_PERMISSIONS } from '../config/rbac';

export default function UserManagementModal({ 
  isOpen, 
  onClose, 
  users, 
  currentUser, 
  onSwitchUser, 
  onCreateUser 
}) {
  const [activeTab, setActiveTab] = useState('switch'); // 'switch' | 'create' | 'permissions'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.CASHIER,
    pin: ''
  });

  if (!isOpen) return null;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.pin) {
      alert('Please fill out Name, Email, and 4-digit PIN!');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      pin: formData.pin,
      status: 'Active'
    };

    onCreateUser(newUser);
    setFormData({ name: '', email: '', role: ROLES.CASHIER, pin: '' });
    setActiveTab('switch');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">RBAC User & Role Management</h3>
              <p className="text-xs text-slate-400">Manage store access privileges & security permissions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab('switch')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'switch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch User Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New User</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'permissions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Role Matrix</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Tab 1: Switch Active User Profile */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Select Active Account to Test RBAC Access Restrictions:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((usr) => {
                  const isCurrent = currentUser?.id === usr.id;
                  return (
                    <div
                      key={usr.id}
                      onClick={() => onSwitchUser(usr)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 font-extrabold text-indigo-400 flex items-center justify-center text-sm">
                          {usr.name.split(' ').map(n => n[0]).join('')}
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                            {usr.name}
                            {isCurrent && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          </h4>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                            usr.role === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            usr.role === ROLES.MANAGER ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                            usr.role === ROLES.CASHIER ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {usr.role}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); onSwitchUser(usr); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isCurrent 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {isCurrent ? 'Active' : 'Switch'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Create New User Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="alex.morgan@nexusretail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Assign User Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={ROLES.ADMIN}>Admin (Full System Access)</option>
                    <option value={ROLES.MANAGER}>Store Manager</option>
                    <option value={ROLES.CASHIER}>Cashier (POS Checkout Only)</option>
                    <option value={ROLES.CLERK}>Stock Clerk (Inventory Intake Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Security PIN (4 digits)
                  </label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="••••"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-center tracking-widest text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20"
              >
                Create Account & Grant Role Privileges
              </button>
            </form>
          )}

          {/* Tab 3: Permissions Matrix Overview */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                System Security & Access Matrix:
              </span>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">System Feature</th>
                      <th className="py-2.5 px-3 text-center">Admin</th>
                      <th className="py-2.5 px-3 text-center">Manager</th>
                      <th className="py-2.5 px-3 text-center">Cashier</th>
                      <th className="py-2.5 px-3 text-center">Clerk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[
                      { name: 'Dashboard Financial Metrics', p: 'view_financials' },
                      { name: 'View Product Catalog', p: 'view_products' },
                      { name: 'Add / Restock Products', p: 'add_product' },
                      { name: 'Edit Cost & Selling Prices', p: 'edit_pricing' },
                      { name: 'Delete Products Record', p: 'delete_product' },
                      { name: 'Execute POS Checkout', p: 'execute_pos' },
                      { name: 'User Role Management', p: 'manage_users' }
                    ].map((row) => (
                      <tr key={row.p} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{row.name}</td>
                        {Object.values(ROLES).map((role) => {
                          const allowed = ROLE_PERMISSIONS[role]?.includes(row.p);
                          return (
                            <td key={role} className="py-2.5 px-3 text-center">
                              {allowed ? (
                                <span className="inline-block p-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                  ALLOWED
                                </span>
                              ) : (
                                <span className="inline-block p-1 rounded-md bg-red-500/10 text-slate-400 text-[10px]">
                                  DENIED
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Active: <strong className="text-slate-200">{currentUser?.name}</strong> ({currentUser?.role})</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
