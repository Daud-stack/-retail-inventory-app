import React, { useState, useEffect } from 'react';
import { Truck, PackageSearch, Users, Plus, Star, Phone, Mail, FileText, CheckCircle, Clock, Ban, Eye, X, AlertCircle } from 'lucide-react';
import { getSuppliers, addSupplier, getPurchaseOrders, createPurchaseOrder, generatePOFromLowStock, updatePOStatus } from '../services/supplierEngine';
import { logAuditEvent, AUDIT_ACTIONS } from '../services/auditLogger';

const SupplierManagementView = ({ products, onRestockItem, currentUser }) => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal States
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [targetSupplierForPO, setTargetSupplierForPO] = useState(null);

  // New Supplier Form
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    categories: '',
    leadTimeDays: 3,
    rating: 5.0
  });

  // Manual PO Form State
  const [poItems, setPoItems] = useState([
    { productId: '', name: '', quantity: 10, unitCost: 0 }
  ]);

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
      const generated = generatePOFromLowStock(products || []);
      loadData();
      setIsGenerating(false);
      if (generated.length > 0) {
        logAuditEvent({ userId: currentUser?.id, userName: currentUser?.name, role: currentUser?.role, action: AUDIT_ACTIONS.CREATE_PRODUCT, target: 'Purchase Orders', details: `Auto-generated ${generated.length} POs from low stock` });
      }
      setActiveTab('orders');
    }, 800);
  };

  const handleAddSupplierSubmit = (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.email) return;

    const categoriesArray = newSupplier.categories
      ? newSupplier.categories.split(',').map(c => c.trim()).filter(Boolean)
      : ['General'];

    addSupplier({
      ...newSupplier,
      rating: parseFloat(newSupplier.rating) || 5.0,
      leadTimeDays: parseInt(newSupplier.leadTimeDays, 10) || 3,
      categories: categoriesArray
    });

    logAuditEvent({ userId: currentUser?.id, userName: currentUser?.name, role: currentUser?.role, action: AUDIT_ACTIONS.CREATE_USER, target: newSupplier.name, details: `Added new supplier ${newSupplier.name}` });

    setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', categories: '', leadTimeDays: 3, rating: 5.0 });
    setIsAddSupplierOpen(false);
    loadData();
  };

  const handleOpenCreatePO = (supplier = null) => {
    setTargetSupplierForPO(supplier || suppliers[0] || null);
    setPoItems([{ productId: products?.[0]?.id || '', name: products?.[0]?.name || '', quantity: 10, unitCost: (products?.[0]?.price || 10) * 0.6 }]);
    setIsCreatePOOpen(true);
  };

  const handlePoItemChange = (index, field, value) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      updated[index] = {
        productId: value,
        name: prod ? prod.name : 'Item',
        quantity: updated[index].quantity || 10,
        unitCost: prod ? (prod.price * 0.6) : 10
      };
    } else {
      updated[index][field] = field === 'name' ? value : Number(value);
    }
    setPoItems(updated);
  };

  const handleAddPoItemRow = () => {
    setPoItems([...poItems, { productId: products?.[0]?.id || '', name: products?.[0]?.name || '', quantity: 10, unitCost: 10 }]);
  };

  const handleRemovePoItemRow = (index) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleCreatePOSubmit = (e) => {
    e.preventDefault();
    if (!targetSupplierForPO) return;

    const totalValue = poItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    createPurchaseOrder({
      supplierId: targetSupplierForPO.id,
      items: poItems,
      totalValue: totalValue
    });

    logAuditEvent({ userId: currentUser?.id, userName: currentUser?.name, role: currentUser?.role, action: AUDIT_ACTIONS.CREATE_PRODUCT, target: targetSupplierForPO.name, details: `Created PO for $${totalValue.toFixed(2)}` });

    setIsCreatePOOpen(false);
    loadData();
    setActiveTab('orders');
  };

  const handleStatusChange = (poId, newStatus) => {
    updatePOStatus(poId, newStatus, onRestockItem);
    logAuditEvent({ userId: currentUser?.id, userName: currentUser?.name, role: currentUser?.role, action: AUDIT_ACTIONS.EDIT_PRODUCT, target: poId, details: `Updated PO status to ${newStatus}` });
    loadData();
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
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${styles[status] || styles['Draft']}`}>
        {icons[status]} {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Truck className="w-32 h-32 text-indigo-400" /></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Truck className="w-8 h-8 text-indigo-400" />
              Supplier & Purchase Order System
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl">
              Manage supplier directories, create manual or automated purchase orders, track lead times, and restock inventory directly upon receiving orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Supplier
            </button>
            <button 
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${isGenerating ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20'}`}
            >
              <PackageSearch className="w-4 h-4" />
              {isGenerating ? 'Analyzing Stock...' : 'Auto-Generate POs'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'suppliers' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Suppliers Directory ({suppliers.length})</div>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'orders' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Purchase Orders ({purchaseOrders.length})</div>
          </button>
        </div>

        {activeTab === 'orders' && (
          <button
            onClick={() => handleOpenCreatePO()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Manual PO
          </button>
        )}
      </div>

      {/* Suppliers Grid Tab */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors">{supplier.name}</h3>
                  <span className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg text-xs text-yellow-400 border border-slate-800">
                    <Star className="w-3 h-3 fill-current" /> {supplier.rating}
                  </span>
                </div>
                <div className="space-y-2.5 mb-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Contact: <strong className="text-slate-200">{supplier.contactPerson}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Expected Lead Time: <strong className="text-indigo-400">{supplier.leadTimeDays} days</strong></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {supplier.categories.map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[11px] font-medium rounded-md border border-indigo-500/20">{cat}</span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleOpenCreatePO(supplier)}
                className="w-full py-2 bg-slate-800 hover:bg-indigo-600/30 text-slate-200 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 rounded-xl transition-all flex justify-center items-center gap-2 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" /> Create Purchase Order
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Orders Table Tab */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">PO Number</th>
                  <th className="p-4 font-semibold">Supplier</th>
                  <th className="p-4 font-semibold">Date Created</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Total Value</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500">
                      <PackageSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-sm">No purchase orders found</p>
                      <p className="text-xs text-slate-600 mt-1">Click "Auto-Generate POs" to create restock requests based on low stock alerts.</p>
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map(po => {
                    const supplier = suppliers.find(s => s.id === po.supplierId);
                    return (
                      <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">{po.id}</td>
                        <td className="p-4 font-medium text-slate-100">{supplier ? supplier.name : 'General Supplier'}</td>
                        <td className="p-4 text-slate-400">{po.dateCreated}</td>
                        <td className="p-4 text-slate-300 font-semibold">{po.items ? po.items.length : 0} items</td>
                        <td className="p-4 text-emerald-400 font-bold text-sm">${po.totalValue?.toFixed(2)}</td>
                        <td className="p-4">{getStatusBadge(po.status)}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedPO(po)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                          <select 
                            value={po.status}
                            onChange={(e) => handleStatusChange(po.id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Received">Received (Restock)</option>
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

      {/* MODAL 1: Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" /> Add New Supplier
              </h2>
              <button onClick={() => setIsAddSupplierOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Company / Supplier Name *</label>
                <input 
                  type="text" 
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  placeholder="e.g. Delta Beverages Distributors"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contact Person</label>
                <input 
                  type="text" 
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                  placeholder="e.g. John Sibanda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    placeholder="orders@supplier.co.zw"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    placeholder="+263 77 000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Categories (Comma separated)</label>
                <input 
                  type="text" 
                  value={newSupplier.categories}
                  onChange={(e) => setNewSupplier({...newSupplier, categories: e.target.value})}
                  placeholder="Groceries, Beverages, Dairy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lead Time (Days)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newSupplier.leadTimeDays}
                    onChange={(e) => setNewSupplier({...newSupplier, leadTimeDays: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Rating (1 to 5)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    max="5" 
                    min="1"
                    value={newSupplier.rating}
                    onChange={(e) => setNewSupplier({...newSupplier, rating: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setIsAddSupplierOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Manual Purchase Order */}
      {isCreatePOOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Create Manual Purchase Order
              </h2>
              <button onClick={() => setIsCreatePOOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Supplier</label>
                <select
                  value={targetSupplierForPO?.id || ''}
                  onChange={(e) => setTargetSupplierForPO(suppliers.find(s => s.id === e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-400 font-semibold">Order Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddPoItemRow}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item Row
                  </button>
                </div>

                <div className="space-y-2">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <select
                        value={item.productId}
                        onChange={(e) => handlePoItemChange(idx, 'productId', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handlePoItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs text-center"
                      />

                      <div className="w-24 text-right font-mono text-emerald-400 font-semibold">
                        ${((item.quantity || 0) * (item.unitCost || 0)).toFixed(2)}
                      </div>

                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoItemRow(idx)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400">Total Est. PO Value:</span>
                <span className="text-emerald-400 font-mono text-base">
                  ${poItems.reduce((acc, i) => acc + ((i.quantity || 0) * (i.unitCost || 0)), 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreatePOOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30">
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PO Details Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Purchase Order Details
                </h2>
                <p className="text-xs font-mono text-indigo-400">{selectedPO.id}</p>
              </div>
              <button onClick={() => setSelectedPO(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Supplier</span>
                  <strong className="text-slate-100 font-semibold text-sm">
                    {suppliers.find(s => s.id === selectedPO.supplierId)?.name || 'General Supplier'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Status</span>
                  {getStatusBadge(selectedPO.status)}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-400 uppercase font-mono text-[10px]">Itemized Items</h4>
                <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800">
                  {selectedPO.items?.map((item, i) => (
                    <div key={i} className="p-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-medium text-slate-200 block">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Qty: {item.quantity} units</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-semibold">
                        ${((item.quantity || 0) * (item.unitCost || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-sm">
                <span className="text-slate-300">Total Purchase Value:</span>
                <span className="text-emerald-400 font-mono text-base">${selectedPO.totalValue?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedPO(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagementView;

