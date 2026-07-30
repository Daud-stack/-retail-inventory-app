import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  Lock, 
  UserCheck, 
  ShieldAlert,
  Sparkles,
  Key,
  Store,
  Layers
} from 'lucide-react';
import { ROLES, ROLE_PERMISSIONS, PERMISSIONS } from '../config/rbac';

export default function UserManagementView({ 
  users, 
  currentUser, 
  onSwitchUser, 
  onCreateUser 
}) {
  const [activeSubTab, setActiveSubTab] = useState('accounts'); // 'accounts' | 'create' | 'permissions'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.CASHIER,
    pin: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const maxUsersAllowed = 25;
  const isUserQuotaReached = users.length >= maxUsersAllowed;

  const canCreateUsers = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.SUPER_ADMIN;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!canCreateUsers) {
      alert('Permission Denied: Only Admin accounts are authorized to provision user profiles.');
      return;
    }

    if (!formData.name || !formData.email || !formData.pin) {
      alert('Please fill out Name, Email, and 4-digit Security PIN!');
      return;
    }

    if (isUserQuotaReached) {
      alert(`User quota limit reached (${users.length} / ${maxUsersAllowed} Users)! Please upgrade store license plan.`);
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
    setSuccessMsg(`Successfully created ${newUser.role} Account!`);
    setTimeout(() => setSuccessMsg(''), 4000);
    setActiveSubTab('accounts');
  };

  const displayUsers = currentUser?.role === ROLES.SUPER_ADMIN 
    ? users 
    : users.filter(u => u.role !== ROLES.SUPER_ADMIN);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 inline-flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5" /> ROLE-BASED ACCESS CONTROL (RBAC)
          </span>
          <h2 className="text-xl font-extrabold text-slate-100">User & Role Management Center</h2>
          <p className="text-xs text-slate-400">Manage store role accounts, security PINs, and RBAC permission matrices</p>
        </div>

        {/* User Quota Indicator */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
            {users.length}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">User Quota Limit</span>
            <span className="text-[10px] text-slate-400 font-mono">{users.length} / {maxUsersAllowed} Accounts Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'accounts'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Role Accounts ({users.length})</span>
        </button>

        {canCreateUsers && (
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'create'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision New Role Account</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'permissions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Permissions Matrix</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SubTab 1: Active Role Accounts List */}
      {activeSubTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.filter(u => u.role !== ROLES.SUPER_ADMIN).map((usr) => {
            const isCurrent = currentUser?.id === usr.id;
            const isSuperAdminAccount = usr.role === ROLES.SUPER_ADMIN;
            const canSwitchToThisUser = !isSuperAdminAccount || currentUser?.role === ROLES.SUPER_ADMIN;

            const roleCode = isSuperAdminAccount ? 'SA' :
                             usr.role === ROLES.ADMIN ? 'ADM' :
                             usr.role === ROLES.MANAGER ? 'MGR' :
                             usr.role === ROLES.CASHIER ? 'POS' : 'CLK';
            return (
              <div
                key={usr.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-xl ring-1 ring-indigo-500/30'
                    : canSwitchToThisUser
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 font-extrabold text-indigo-400 flex items-center justify-center text-xs shadow-inner">
                      {roleCode}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                        {usr.role} Account
                        {isCurrent && <UserCheck className="w-4 h-4 text-emerald-400" />}
                      </h4>
                      <span className="text-[11px] text-slate-400 block font-mono">{usr.email}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    usr.role === ROLES.SUPER_ADMIN ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    usr.role === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    usr.role === ROLES.MANAGER ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                    usr.role === ROLES.CASHIER ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {usr.role}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {isSuperAdminAccount && !canSwitchToThisUser ? 'Super Admin Protected' : 'Security Credentials Verified'}
                  </span>

                  <button
                    disabled={!canSwitchToThisUser}
                    onClick={() => {
                      if (canSwitchToThisUser) onSwitchUser(usr);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : canSwitchToThisUser
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 text-[10px] cursor-not-allowed'
                    }`}
                  >
                    {isCurrent ? 'Active Session' : 'PIN Required'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SubTab 2: Provision New Role Account */}
      {activeSubTab === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <span>Create New Store Role Account</span>
            </h3>
            <p className="text-xs text-slate-400">Assign system permissions and 4-digit authentication security PIN</p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Account Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Supervisor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Account Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="supervisor@nexusretail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Assign System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {currentUser?.role === ROLES.SUPER_ADMIN && (
                    <option value={ROLES.SUPER_ADMIN}>Super Admin (Multi-Tenant Command Center)</option>
                  )}
                  <option value={ROLES.ADMIN}>Admin (Full Store Access)</option>
                  <option value={ROLES.MANAGER}>Manager (Inventory & Analytics)</option>
                  <option value={ROLES.CASHIER}>Cashier (POS & Invoicing)</option>
                  <option value={ROLES.CLERK}>Stock Clerk (Catalog & Restock)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">4-Digit Security PIN</label>
                <input
                  type="password"
                  maxLength="4"
                  required
                  placeholder="••••"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUserQuotaReached}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision Role Account</span>
            </button>
          </form>
        </div>
      )}

      {/* SubTab 3: RBAC Permissions Matrix */}
      {activeSubTab === 'permissions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">Strict feature and data access permissions per system role</p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-extrabold">Permission Capability</th>
                  <th className="p-3.5 font-extrabold text-center text-emerald-400">Super Admin</th>
                  <th className="p-3.5 font-extrabold text-center text-purple-400">Admin</th>
                  <th className="p-3.5 font-extrabold text-center text-indigo-400">Manager</th>
                  <th className="p-3.5 font-extrabold text-center text-cyan-400">Cashier</th>
                  <th className="p-3.5 font-extrabold text-center text-amber-400">Clerk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {Object.values(PERMISSIONS).map((perm) => (
                  <tr key={perm} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-200 capitalize">
                      {perm.replace('_', ' ')}
                    </td>
                    {[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.CLERK].map((r) => {
                      const hasPerm = ROLE_PERMISSIONS[r]?.includes(perm);
                      return (
                        <td key={r} className="p-3.5 text-center">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-slate-800" />
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
  );
}
