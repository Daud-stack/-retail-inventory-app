import React, { useState, useEffect } from 'react';
import { Users, Award, ShoppingBag, Plus, Search, Star, Phone, Mail, X, Edit, MapPin } from 'lucide-react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../services/customerEngine';

const CustomerManagementView = ({ currentUser }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const totalCustomers = customers.length;
  const activeLoyalty = customers.filter(c => c.points > 0).length;
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const topTierCount = customers.filter(c => c.tier === 'Gold' || c.tier === 'Platinum').length;

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.phone.includes(searchTerm);
    const matchesTier = tierFilter === 'All' || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Platinum': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Silver': return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
      case 'Bronze': return 'bg-orange-700/20 text-orange-400 border-orange-700/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setCustomers(getCustomers());
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, email: customer.email, phone: customer.phone });
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6 text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Customer Management & Loyalty
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage customer profiles, loyalty tiers, and purchase history.</p>
        </div>
        <button 
          onClick={() => { setEditingCustomer(null); setFormData({name:'', email:'', phone:''}); setShowModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-indigo-900/20"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-blue-400' },
          { title: 'Active Loyalty Members', value: activeLoyalty, icon: Star, color: 'text-yellow-400' },
          { title: 'Total Points Issued', value: totalPoints, icon: Award, color: 'text-purple-400' },
          { title: 'Top Tier (Gold+)', value: topTierCount, icon: ShoppingBag, color: 'text-emerald-400' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">{kpi.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select 
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
        >
          <option value="All">All Tiers</option>
          <option value="Bronze">Bronze</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
          <option value="Platinum">Platinum</option>
        </select>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-700/50 text-slate-400">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Tier</th>
                <th className="p-4 font-medium">Points</th>
                <th className="p-4 font-medium">Total Spend</th>
                <th className="p-4 font-medium">Visits</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-800/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{customer.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Star className="w-3 h-3"/> Last: {customer.lastVisit || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {customer.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {customer.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTierColor(customer.tier)}`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-indigo-400">{customer.points}</td>
                  <td className="p-4 text-slate-300">${customer.totalSpent.toFixed(2)}</td>
                  <td className="p-4 text-slate-300">{customer.visitCount}</td>
                  <td className="p-4">
                    <button onClick={() => openEdit(customer)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No customers found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementView;
