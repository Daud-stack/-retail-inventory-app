import React, { useState, useEffect } from 'react';
import { 
  ScanLine, 
  Save, 
  RotateCcw, 
  CheckCircle2
} from 'lucide-react';

export default function ProductForm({ 
  onSaveProduct, 
  editingProduct, 
  setEditingProduct, 
  onOpenScanner,
  scannedBarcode,
  setScannedBarcode
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Clothing',
    price: '',
    cost: '',
    stock: '',
    minStock: '5',
    supplier: '',
    location: '',
    unit: 'pcs'
  });

  const [notification, setNotification] = useState(null);

  // Populate form if editing or if barcode scanned
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        category: editingProduct.category || 'Clothing',
        price: editingProduct.price ? String(editingProduct.price) : '',
        cost: editingProduct.cost ? String(editingProduct.cost) : '',
        stock: editingProduct.stock !== undefined ? String(editingProduct.stock) : '',
        minStock: editingProduct.minStock !== undefined ? String(editingProduct.minStock) : '5',
        supplier: editingProduct.supplier || '',
        location: editingProduct.location || '',
        unit: editingProduct.unit || 'pcs'
      });
    }
  }, [editingProduct]);

  useEffect(() => {
    if (scannedBarcode) {
      setFormData(prev => ({ ...prev, sku: scannedBarcode }));
      setNotification(`Barcode SKU ${scannedBarcode} applied from scanner!`);
      setTimeout(() => setNotification(null), 4000);
      setScannedBarcode('');
    }
  }, [scannedBarcode, setScannedBarcode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price) {
      alert('Please fill out Product Name, Barcode/SKU, and Price!');
      return;
    }

    const payload = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      minStock: parseInt(formData.minStock, 10) || 5,
      supplier: formData.supplier || 'Standard Distributor',
      location: formData.location || 'Warehouse Main',
      unit: formData.unit || 'pcs',
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    onSaveProduct(payload);

    setNotification(editingProduct ? 'Product updated successfully!' : 'New stock item added to inventory!');
    setTimeout(() => setNotification(null), 4000);

    if (!editingProduct) {
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Clothing',
      price: '',
      cost: '',
      stock: '',
      minStock: '5',
      supplier: '',
      location: '',
      unit: 'pcs'
    });
    if (setEditingProduct) setEditingProduct(null);
  };

  // Preset Sample Quick Loaders
  const loadPreset = (type) => {
    if (type === 'clothing') {
      setFormData({
        name: 'Denim Oversized Trucker Jacket',
        sku: `CLN-${Math.floor(100000 + Math.random() * 900000)}`,
        category: 'Clothing',
        price: '79.99',
        cost: '38.00',
        stock: '25',
        minStock: '8',
        supplier: 'Apex Apparel Inc.',
        location: 'Rack C-02',
        unit: 'pcs'
      });
    } else if (type === 'grocery') {
      setFormData({
        name: 'Organic Matcha Green Tea Powder (100g)',
        sku: `GRO-${Math.floor(100000 + Math.random() * 900000)}`,
        category: 'Groceries',
        price: '21.50',
        cost: '11.20',
        stock: '40',
        minStock: '12',
        supplier: 'Zen Organics Ltd.',
        location: 'Aisle G-Shelf 4',
        unit: 'tin'
      });
    } else if (type === 'misc') {
      setFormData({
        name: 'Noise Cancelling Wireless Earbuds',
        sku: `MSC-${Math.floor(100000 + Math.random() * 900000)}`,
        category: 'Miscellaneous',
        price: '119.00',
        cost: '52.00',
        stock: '15',
        minStock: '6',
        supplier: 'Sonic Audio Labs',
        location: 'Display Case 01',
        unit: 'box'
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 inline-block mb-2">
            {editingProduct ? 'EDIT MODE' : 'NEW STOCK ENTRY'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-100">
            {editingProduct ? `Edit: ${editingProduct.name}` : 'Stock Inventory Intake Form'}
          </h2>
          <p className="text-xs text-slate-400">Specify SKU, pricing, category, and minimum stock reorder levels</p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadPreset('clothing')}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
          >
            + Sample Clothing
          </button>
          <button
            type="button"
            onClick={() => loadPreset('grocery')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            + Sample Grocery
          </button>
          <button
            type="button"
            onClick={() => loadPreset('misc')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            + Sample Misc
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Barcode / SKU with Scan Button */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Barcode / SKU Code <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. CLN-849201"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 font-mono text-sm text-indigo-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={onOpenScanner}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 shrink-0"
              >
                <ScanLine className="w-4 h-4" />
                <span>Simulate Barcode Scan</span>
              </button>
            </div>
          </div>

          {/* Product Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Vintage Denim Jacket"
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Retail Category <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="Clothing">Clothing (Apparel & Wearables)</option>
                <option value="Groceries">Groceries (Food & Beverages)</option>
                <option value="Miscellaneous">Miscellaneous (Tech & Accessories)</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                ▼
              </div>
            </div>
          </div>

          {/* Unit Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Measurement Unit
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="bottle">Bottle</option>
              <option value="carton">Carton</option>
              <option value="pack">Pack</option>
              <option value="box">Box</option>
              <option value="set">Set</option>
              <option value="loaf">Loaf</option>
            </select>
          </div>

          {/* Selling Price ($) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Retail Selling Price ($) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Cost Price ($) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Unit Purchase Cost ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Initial Stock Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Initial Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Low Stock Reorder Threshold */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Reorder Alert Threshold
            </label>
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              placeholder="5"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Supplier / Distributor
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="e.g. UrbanWear Apparel"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Storage Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Store / Aisle Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Aisle C - Rack 04"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingProduct ? 'Update Stock Record' : 'Save New Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
