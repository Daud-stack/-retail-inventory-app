import React, { useState, useEffect } from 'react';
import { Truck, PackageSearch, Users, Plus, Star, Search, Filter, Phone, Mail, FileText, CheckCircle, Clock, Ban } from 'lucide-react';
import { getSuppliers, getPurchaseOrders, generatePOFromLowStock, updatePOStatus } from '../services/supplierEngine';

const SupplierManagementView = ({ products, currentUser }) => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSuppliers(getSuppliers());
    setPurchaseOrders(getPurchaseOrders());
  };

  const handleAutoGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generatePOFromLowStock(products || []);
      loadData();
      setIsGenerating(false);
      setActiveTab('orders');
    }, 800);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Draft': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      'Sent': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Confirmed': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Received': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const icons = {
      'Draft': <FileText className="w-3 h-3" />,
      'Sent': <PackageSearch className="w-3 h-3" />,
      'Confirmed': <CheckCircle className="w-3 h-3" />,
      'Received': <Truck className="w-3 h-3" />,
      'Cancelled': <Ban className="w-3 h-3" />,
    };
    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${styles[status]}`}>
        {icons[status]} {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 text-slate-200">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Truck className="w-32 h-32 text-indigo-400" /></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Truck className="w-8 h-8 text-indigo-400" />
              Supplier & PO System
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl">Manage supplier relationships, track purchase orders, and automatically generate restock requests based on inventory levels.</p>
          </div>
          <button 
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg ${isGenerating ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20'}`}
          >
            <PackageSearch className="w-5 h-5" />
            {isGenerating ? 'Analyzing Stock...' : 'Auto-Generate POs'}
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-700/50">
        <button 
          onClick={() => setActiveTab('suppliers')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'suppliers' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Suppliers Directory</div>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'orders' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Purchase Orders</div>
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/60 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors">{supplier.name}</h3>
                <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded text-xs text-yellow-400 border border-slate-700/50">
                  <Star className="w-3 h-3 fill-current" /> {supplier.rating}
                </span>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-400"><Users className="w-4 h-4"/></div>
                  {supplier.contactPerson}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-400"><Phone className="w-4 h-4"/></div>
                  {supplier.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-400"><Mail className="w-4 h-4"/></div>
                  {supplier.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-400"><Clock className="w-4 h-4"/></div>
                  Lead time: {supplier.leadTimeDays} days
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {supplier.categories.map(cat => (
                  <span key={cat} className="px-2 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded border border-indigo-500/20">{cat}</span>
                ))}
              </div>
              <button className="w-full py-2 bg-slate-900 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/30 rounded-lg transition-all flex justify-center items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> New Purchase Order
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700/50 text-slate-400">
                <tr>
                  <th className="p-4 font-medium">PO Number</th>
                  <th className="p-4 font-medium">Supplier</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Total Value</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">No purchase orders found. Generate some from low stock!</td>
                  </tr>
                ) : (
                  purchaseOrders.map(po => {
                    const supplier = suppliers.find(s => s.id === po.supplierId);
                    return (
                      <tr key={po.id} className="hover:bg-slate-800/80 transition-colors">
                        <td className="p-4 font-mono text-indigo-400">{po.id}</td>
                        <td className="p-4 font-medium text-white">{supplier ? supplier.name : 'Unknown Supplier'}</td>
                        <td className="p-4 text-slate-400">{po.dateCreated}</td>
                        <td className="p-4 text-slate-300">{po.items ? po.items.length : 0} items</td>
                        <td className="p-4 text-slate-200 font-medium">${po.totalValue?.toFixed(2)}</td>
                        <td className="p-4">{getStatusBadge(po.status)}</td>
                        <td className="p-4">
                          <select 
                            value={po.status}
                            onChange={(e) => {
                              updatePOStatus(po.id, e.target.value);
                              loadData();
                            }}
                            className="bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Received">Received</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagementView;
