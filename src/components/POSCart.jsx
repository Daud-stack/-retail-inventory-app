import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ScanLine, 
  Receipt, 
  CreditCard, 
  Wallet, 
  Banknote, 
  Search, 
  RotateCcw, 
  TrendingUp,
  User,
  Zap,
  History,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Building,
  Store
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { hasPermission, PERMISSIONS } from '../config/rbac';
import { getSmartCartRecommendations } from '../services/dataScienceEngine';
import { 
  generateTaxBreakdown, 
  calculateIMTT, 
  calculateWholesalerWithholding, 
  getTraderProfile, 
  updateTraderProfile, 
  TRADER_TIERS, 
  checkVATRegistrationRequirement,
  formatCurrency,
  getExchangeRate
} from '../services/taxCurrencyEngine';

export default function POSCart({ 
  products, 
  cart, 
  setCart, 
  onGenerateReceipt, 
  onOpenScanner,
  transactions = [],
  currentUser
}) {
  const canExecutePOS = hasPermission(currentUser?.role, PERMISSIONS.EXECUTE_POS);
  const canViewFinancials = hasPermission(currentUser?.role, PERMISSIONS.VIEW_FINANCIALS);

  const [posSearch, setPosSearch] = useState('');
  const [selectedPosCategory, setSelectedPosCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [skuInput, setSkuInput] = useState('');

  // Trader & Currency State
  const [traderProfile, setTraderProfileState] = useState(getTraderProfile());
  const [selectedCurrency, setSelectedCurrency] = useState('ZIG');
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitPayment, setSplitPayment] = useState({ zigAmount: 0, usdAmount: 0 });
  const [isWholesalerMode, setIsWholesalerMode] = useState(false);
  const [hasTaxClearance, setHasTaxClearance] = useState(traderProfile.hasValidTaxClearance);

  // Sync trader profile changes
  const handleToggleTraderTier = (tier) => {
    const updated = updateTraderProfile({ tier });
    setTraderProfileState(getTraderProfile());
  };

  // Smart Data Science Cross-Sell Recommendations
  const smartRecommendations = getSmartCartRecommendations(cart, products);

  const handleAddToCart = (product) => {
    if (!canExecutePOS) {
      alert(`Access Denied: Role (${currentUser?.role}) is restricted from POS cart checkout.`);
      return;
    }

    if (product.stock <= 0) {
      alert(`${product.name} is currently out of stock!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Cannot add more. Maximum available stock reached (${product.stock} units).`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
  };

  const updateQty = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock) {
            alert(`Stock limit reached (${item.stock} available).`);
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeItem = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleSkuSubmit = (e) => {
    e.preventDefault();
    if (!skuInput.trim()) return;
    const found = products.find(p => p.sku.toLowerCase() === skuInput.trim().toLowerCase());
    if (found) {
      handleAddToCart(found);
      setSkuInput('');
    } else {
      alert(`No product found matching SKU: "${skuInput}"`);
    }
  };

  const handleLoadDemoBasket = () => {
    const jacket = products.find(p => p.sku === 'CLN-849201') || products[0];
    const coffee = products.find(p => p.sku === 'GRO-194820') || products[1];
    const mouse = products.find(p => p.sku === 'MSC-774910') || products[2];

    const demoCart = [];
    if (jacket && jacket.stock > 0) demoCart.push({ ...jacket, qty: 1 });
    if (coffee && coffee.stock > 0) demoCart.push({ ...coffee, qty: 2 });
    if (mouse && mouse.stock > 0) demoCart.push({ ...mouse, qty: 1 });

    setCart(demoCart);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  };

  // Convert cart for tax calculation
  const formattedCartItems = cart.map(item => ({
    name: item.name,
    category: item.category,
    qty: item.qty,
    unitPrice: item.price
  }));

  // Generate dynamic tax breakdown
  const taxBreakdown = generateTaxBreakdown(
    formattedCartItems, 
    selectedCurrency, 
    true, // VAT inclusive
    isSplitPayment ? splitPayment : null
  );

  const subtotal = taxBreakdown.subtotal;
  const totalCost = cart.reduce((acc, item) => acc + ((item.cost || 0) * item.qty), 0);
  const grossProfit = Math.max(0, subtotal - totalCost);
  const grossMarginPct = subtotal > 0 ? ((grossProfit / subtotal) * 100).toFixed(1) : '0.0';

  const taxAmount = taxBreakdown.totalVAT;
  const total = Math.max(0, taxBreakdown.grandTotal - discountAmount);

  // Calculate IMTT for digital transactions (Mobile Money / Electronic Transfer)
  const isDigitalPayment = paymentMethod === 'Mobile Money' || paymentMethod === 'Credit Card';
  const imttCalc = isDigitalPayment ? calculateIMTT(total, selectedCurrency) : { taxAmount: 0 };
  const imttAmount = imttCalc.taxAmount;

  // Calculate Wholesaler Withholding if Wholesaler B2B Mode is active
  const wholesalerWithholding = isWholesalerMode ? calculateWholesalerWithholding(total, hasTaxClearance) : { applies: false, surchargeAmount: 0 };
  const grandTotalPayable = total + imttAmount + (wholesalerWithholding.applies ? wholesalerWithholding.surchargeAmount : 0);

  // Check VAT Threshold warning
  const vatThresholdStatus = checkVATRegistrationRequirement(traderProfile.annualSalesUSD);

  const catalogProducts = products.filter(p => {
    const matchCat = selectedPosCategory === 'All' || p.category === selectedPosCategory;
    const matchSearch = !posSearch || p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleTriggerReceipt = () => {
    if (!canExecutePOS) {
      alert(`Access Restricted: User role (${currentUser?.role}) cannot execute sales receipts.`);
      return;
    }

    if (cart.length === 0) return;
    onGenerateReceipt({
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      dateStr: new Date().toLocaleString(),
      customer: customerName,
      subtotal,
      totalCost,
      grossProfit,
      grossMarginPct,
      taxRate: taxBreakdown.vatRate * 100,
      taxAmount: taxBreakdown.totalVAT,
      presumptiveTaxAmount: taxBreakdown.presumptiveTaxAmount,
      imttAmount,
      wholesalerSurcharge: wholesalerWithholding.surchargeAmount,
      discount: discountAmount,
      total: grandTotalPayable,
      currency: selectedCurrency,
      traderTier: traderProfile.tier,
      multiCurrencySplit: taxBreakdown.multiCurrencySplit,
      section50aWithholding: taxBreakdown.section50aWithholding,
      paymentMethod
    });
  };

  if (!canExecutePOS) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">POS Checkout Restricted</h3>
        <p className="text-xs text-slate-400">
          Your current account role (<strong>{currentUser?.role}</strong>) does not have permission to execute point-of-sale checkout transactions.
        </p>
        <p className="text-xs text-indigo-400">Please switch to an Admin, Manager, or Cashier profile.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top SKU Scan & Demo Shortcut Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSkuSubmit} className="flex items-center gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <ScanLine className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              placeholder="Scan or type barcode SKU (e.g. CLN-849201)..."
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 font-mono text-xs text-indigo-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shrink-0"
          >
            Add SKU
          </button>
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end overflow-x-auto">
          <button
            type="button"
            onClick={handleLoadDemoBasket}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Load Demo Basket</span>
          </button>

          <button
            type="button"
            onClick={onOpenScanner}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <ScanLine className="w-4 h-4" />
            <span>Camera Scanner</span>
          </button>

          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Product Catalog Picker */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-400" />
                Quick Add Catalog
              </h3>
              <span className="text-xs text-slate-400 font-mono">{catalogProducts.length} items available</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter catalog..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                {['All', 'Clothing', 'Groceries', 'Miscellaneous'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedPosCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                      selectedPosCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {catalogProducts.map((p) => {
              const isOut = p.stock <= 0;
              const margin = (((p.price - p.cost) / p.price) * 100).toFixed(0);

              return (
                <div
                  key={p.id}
                  onClick={() => !isOut && handleAddToCart(p)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isOut 
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                      : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/60 hover:scale-[1.01] shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-[10px] text-indigo-400 block">{p.sku}</span>
                      <h4 className="font-bold text-slate-100 text-xs line-clamp-1">{p.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      p.category === 'Clothing' ? 'bg-indigo-500/10 text-indigo-400' :
                      p.category === 'Groceries' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {p.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-sm font-extrabold text-slate-100">${p.price.toFixed(2)}</span>
                      {canViewFinancials && (
                        <span className="text-[10px] text-emerald-400 font-medium ml-1.5">({margin}% margin)</span>
                      )}
                    </div>
                    
                    {isOut ? (
                      <span className="text-[10px] text-red-400 font-bold">Out of stock</span>
                    ) : (
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {transactions.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                Recent POS Sales Audit History
              </h4>
              <div className="divide-y divide-slate-800/60 text-xs">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-400">{tx.id}</span>
                      <span className="text-slate-300">{tx.customer}</span>
                      <span className="text-[10px] text-slate-400">({tx.itemsCount} items)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">${tx.total.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400">{tx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive POS Checkout Cart & Data Science Recommendations */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  Checkout Cart List
                </h3>
                <p className="text-xs text-slate-400">Scanned items for current transaction</p>
              </div>

              <span className="font-mono text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold">
                {cart.reduce((acc, item) => acc + item.qty, 0)} Items
              </span>
            </div>

            {/* DATA SCIENCE SMART CROSS-SELL RECOMMENDATIONS BAR */}
            {smartRecommendations.length > 0 && (
              <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 space-y-2">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Frequently Bought Together (AI Recommendation):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {smartRecommendations.map((rec) => (
                    <button
                      key={rec.product.id}
                      onClick={() => handleAddToCart(rec.product)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-left transition-all shrink-0 flex items-center gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-100 text-[11px] block">{rec.product.name}</span>
                        <span className="text-[10px] text-purple-300 font-semibold">${rec.product.price.toFixed(2)} ({rec.confidence}% match)</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-purple-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="my-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Walk-in Customer">Walk-in Customer</option>
                <option value="Sarah Jenkins (VIP Member)">Sarah Jenkins (VIP Member)</option>
                <option value="Corporate Account #42">Corporate Account #42</option>
                <option value="Urban Retail Partners">Urban Retail Partners</option>
              </select>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2 border-b border-slate-800/80">
                <ShoppingCart className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-medium">Cart is currently empty</p>
                <p className="text-[11px] text-slate-400">Click <strong>⚡ Load Demo Basket</strong> above for live demo!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1 my-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">{item.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({item.sku})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ${item.price.toFixed(2)} x {item.qty} = <span className="font-bold text-slate-200">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-slate-100 w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && canViewFinancials && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-slate-300 font-semibold block text-[11px]">Est. Gross Profit</span>
                  <span className="text-emerald-400 font-bold text-sm">+${grossProfit.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-300 font-semibold block text-[11px]">Profit Margin</span>
                <span className="text-emerald-300 font-bold text-sm">{grossMarginPct}%</span>
              </div>
            </div>
          )}

          {/* TRADER TIER & CURRENCY SELECTOR CONTROL PANEL */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            {/* Trader Tier Segmented Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-indigo-400" /> Trader Profile Tier:
              </span>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggleTraderTier(TRADER_TIERS.FORMAL)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    traderProfile.tier === TRADER_TIERS.FORMAL 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building className="w-3 h-3" /> Formal (15.5% VAT)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleTraderTier(TRADER_TIERS.INFORMAL)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    traderProfile.tier === TRADER_TIERS.INFORMAL 
                      ? 'bg-amber-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Store className="w-3 h-3" /> Informal (Presumptive)
                </button>
              </div>
            </div>

            {/* Threshold Warning Notification Banner if > $25,000 USD */}
            {vatThresholdStatus.warningMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="leading-tight text-[11px]">{vatThresholdStatus.warningMessage}</p>
              </div>
            )}

            {/* Currency & Split Payment Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Currency:</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="ZIG">ZiG (Zimbabwe Gold)</option>
                  <option value="USD">USD ($)</option>
                </select>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={isSplitPayment}
                    onChange={(e) => setIsSplitPayment(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Split ZiG/USD</span>
                </label>
              </div>
            </div>

            {/* Split Payment Mixed Currency Inputs */}
            {isSplitPayment && (
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">ZiG Paid</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500 ZiG"
                    value={splitPayment.zigAmount || ''}
                    onChange={(e) => setSplitPayment({ ...splitPayment, zigAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">USD Paid ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10.00 $"
                    value={splitPayment.usdAmount || ''}
                    onChange={(e) => setSplitPayment({ ...splitPayment, usdAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Wholesaler B2B Mode Toggle */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isWholesalerMode}
                  onChange={(e) => setIsWholesalerMode(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                />
                <span>Wholesaler B2B Mode</span>
              </label>

              {isWholesalerMode && (
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={hasTaxClearance}
                    onChange={(e) => setHasTaxClearance(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                  <span>Valid ITF263</span>
                </label>
              )}
            </div>

            {isWholesalerMode && wholesalerWithholding.applies && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px]">
                ⚠️ {wholesalerWithholding.warningMessage}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Payment Method:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Credit Card', icon: CreditCard },
                { name: 'Cash', icon: Banknote },
                { name: 'Mobile Money', icon: Wallet }
              ].map((pm) => {
                const Icon = pm.icon;
                const isSel = paymentMethod === pm.name;
                return (
                  <button
                    key={pm.name}
                    type="button"
                    onClick={() => setPaymentMethod(pm.name)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isSel 
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pm.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(subtotal, selectedCurrency)}</span>
              </div>

              {traderProfile.tier === TRADER_TIERS.FORMAL ? (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>ZIMRA VAT ({(taxBreakdown.vatRate * 100).toFixed(1)}%):</span>
                    <span className="font-semibold text-purple-400">{formatCurrency(taxAmount, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 italic">
                    <span>- Section 50A 1/3 Withholding Credit:</span>
                    <span>{formatCurrency(taxBreakdown.section50aWithholding, selectedCurrency)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>Presumptive Turnover Tax (10%):</span>
                  <span className="font-semibold text-amber-400">{formatCurrency(taxBreakdown.presumptiveTaxAmount, selectedCurrency)}</span>
                </div>
              )}

              {isDigitalPayment && imttAmount > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>IMTT Tax ({imttCalc.rateFormatted}):</span>
                  <span className="font-semibold text-cyan-400">{formatCurrency(imttAmount, selectedCurrency)}</span>
                </div>
              )}

              {isWholesalerMode && wholesalerWithholding.applies && (
                <div className="flex justify-between text-amber-400">
                  <span>ZIMRA 5% Wholesaler Surcharge:</span>
                  <span className="font-bold">{formatCurrency(wholesalerWithholding.surchargeAmount, selectedCurrency)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-400">
                <span>Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right font-mono text-xs text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Split Currency Summary Display */}
              {isSplitPayment && taxBreakdown.multiCurrencySplit && (
                <div className="my-2 p-2 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <span className="font-bold text-slate-300 block uppercase font-mono text-[10px]">Split Payment Currency Breakdown:</span>
                  <div className="flex justify-between text-cyan-300">
                    <span>ZiG Total (incl. VAT):</span>
                    <span className="font-bold">ZiG {taxBreakdown.multiCurrencySplit.zigPortion.grandTotalZiG.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-300">
                    <span>USD Total (incl. VAT):</span>
                    <span className="font-bold">${taxBreakdown.multiCurrencySplit.usdPortion.grandTotalUSD.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-100">GRAND TOTAL:</span>
                <span className="text-xl font-extrabold text-emerald-400 tracking-tight">
                  {formatCurrency(grandTotalPayable, selectedCurrency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleTriggerReceipt}
              disabled={cart.length === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <Receipt className="w-5 h-5" />
              <span>Generate Receipt & Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

