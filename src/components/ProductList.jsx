import React, { useState } from 'react';
import { 
  Shirt, 
  ShoppingBag, 
  Box, 
  Search, 
  Filter, 
  Layers, 
  RefreshCw, 
  ShoppingCart, 
  Edit3, 
  List,
  Grid,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { hasPermission, PERMISSIONS } from '../config/rbac';

export default function ProductList({ 
  products, 
  selectedCategoryFilter, 
  setSelectedCategoryFilter,
  searchQuery,
  setSearchQuery,
  onRestockItem,
  onAddToCart,
  onEditProduct,
  setActiveTab,
  currentUser
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const canViewFinancials = hasPermission(currentUser?.role, PERMISSIONS.VIEW_FINANCIALS);
  const canEditProduct = hasPermission(currentUser?.role, PERMISSIONS.EDIT_PRODUCT);
  const canExecutePOS = hasPermission(currentUser?.role, PERMISSIONS.EXECUTE_POS);

  const categories = [
    { id: 'All', label: 'All Categories', icon: Layers },
    { id: 'Clothing', label: 'Clothing', icon: Shirt },
    { id: 'Groceries', label: 'Groceries', icon: ShoppingBag },
    { id: 'Miscellaneous', label: 'Miscellaneous', icon: Box },
  ];

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    const matchCat = selectedCategoryFilter === 'All' || product.category === selectedCategoryFilter;
    
    let matchStatus = true;
    if (statusFilter === 'LowStock') {
      matchStatus = product.stock > 0 && product.stock <= product.minStock;
    } else if (statusFilter === 'OutOfStock') {
      matchStatus = product.stock === 0;
    } else if (statusFilter === 'InStock') {
      matchStatus = product.stock > product.minStock;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.supplier.toLowerCase().includes(q) ||
      (product.location && product.location.toLowerCase().includes(q));

    return matchCat && matchStatus && matchQuery;
  }).sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Category Tabs Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategoryFilter === cat.id;
            const count = cat.id === 'All' ? products.length : products.filter(p => p.category === cat.id).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl border transition-colors ${
              viewMode === 'table' 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl border transition-colors ${
              viewMode === 'grid' 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Grid Cards View"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Sub-bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by SKU, name, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['All', 'InStock', 'LowStock', 'OutOfStock'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                statusFilter === status
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {status === 'All' && 'All Statuses'}
              {status === 'InStock' && 'In Stock'}
              {status === 'LowStock' && 'Low Stock Warning'}
              {status === 'OutOfStock' && 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Product Content */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <Tag className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-200">No matching products found</h4>
          <p className="text-xs text-slate-400">Try adjusting your category tabs or search keywords.</p>
          <button
            onClick={() => { setSelectedCategoryFilter('All'); setStatusFilter('All'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/60 select-none">
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('sku')}>
                    <div className="flex items-center gap-1">SKU / Barcode <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-1">Product Details <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('price')}>
                    <div className="flex items-center gap-1">Price {canViewFinancials && '/ Cost'} <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('stock')}>
                    <div className="flex items-center gap-1">Stock Level <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => {
                  const isLow = product.stock > 0 && product.stock <= product.minStock;
                  const isOut = product.stock === 0;
                  const marginPct = (((product.price - product.cost) / product.price) * 100).toFixed(0);

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-300">
                        {product.sku}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 text-sm">{product.name}</div>
                        <div className="text-[11px] text-slate-400">Supplier: {product.supplier}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          product.category === 'Clothing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                          product.category === 'Groceries' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {product.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">${product.price.toFixed(2)}</div>
                        {canViewFinancials && (
                          <div className="text-[11px] text-slate-400">
                            Cost: ${product.cost.toFixed(2)} <span className="text-emerald-400">({marginPct}% margin)</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${
                            isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {product.stock} {product.unit || 'pcs'}
                          </span>

                          {isOut ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Low Stock ({product.minStock} min)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              In Stock
                            </span>
                          )}
                        </div>

                        <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isOut ? 'w-0' : isLow ? 'bg-amber-500 w-1/3' : 'bg-emerald-500 w-4/5'
                            }`}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                        {product.location || 'Warehouse A'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onRestockItem(product.id, 10)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                            title="Quick Restock +10"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {canEditProduct && (
                            <button
                              onClick={() => {
                                onEditProduct(product);
                                setActiveTab('add-product');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 border border-slate-700 transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canExecutePOS && (
                            <button
                              onClick={() => onAddToCart(product)}
                              disabled={isOut}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                isOut 
                                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-800' 
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20'
                              }`}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>+ POS</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isLow = product.stock > 0 && product.stock <= product.minStock;
            const isOut = product.stock === 0;

            return (
              <div 
                key={product.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {product.sku}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      product.category === 'Clothing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      product.category === 'Groceries' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {product.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-1">{product.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">Supplier: {product.supplier}</p>

                  <div className="flex items-baseline justify-between border-t border-slate-800 pt-3 mb-3">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Price</span>
                      <span className="text-lg font-extrabold text-slate-100">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Stock</span>
                      <span className={`text-base font-extrabold ${
                        isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {product.stock} {product.unit || 'pcs'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onRestockItem(product.id, 10)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> +10 Stock
                  </button>
                  {canExecutePOS && (
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={isOut}
                      className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:bg-slate-800 disabled:text-slate-400"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add POS
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
