import React from 'react';
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Receipt, 
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function QuickCartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  setCart, 
  onGoToPOS,
  products = []
}) {
  if (!isOpen) return null;

  const updateQty = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock) {
            alert(`Maximum stock reached (${item.stock} available).`);
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

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const taxAmount = (subtotal * 8) / 100;
  const total = subtotal + taxAmount;

  // Demo basket loader if cart is empty
  const handleLoadDemoBasket = () => {
    const jacket = products.find(p => p.sku === 'CLN-849201') || products[0];
    const coffee = products.find(p => p.sku === 'GRO-194820') || products[1];
    const mouse = products.find(p => p.sku === 'MSC-774910') || products[2];

    const demoCart = [];
    if (jacket && jacket.stock > 0) demoCart.push({ ...jacket, qty: 1 });
    if (coffee && coffee.stock > 0) demoCart.push({ ...coffee, qty: 2 });
    if (mouse && mouse.stock > 0) demoCart.push({ ...mouse, qty: 1 });

    setCart(demoCart);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">Quick Cart Overview</h3>
              <p className="text-[11px] text-slate-400">{cart.reduce((a, b) => a + b.qty, 0)} items in active cart</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-200">Your POS cart is empty</p>
              <p className="text-[11px] text-slate-400">Scan product SKU barcodes or select items from catalog.</p>
              
              <button
                onClick={handleLoadDemoBasket}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>+ Load Demo Basket</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-bold text-slate-100 text-xs block truncate">{item.name}</span>
                    <span className="font-mono text-[10px] text-indigo-400 block">{item.sku}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      ${item.price.toFixed(2)} x {item.qty} = <strong className="text-slate-100">${(item.price * item.qty).toFixed(2)}</strong>
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs text-slate-100 w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (8%):</span>
                <span className="font-semibold text-slate-200">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-100 border-t border-slate-800 pt-1.5 mt-1">
                <span>Est. Total:</span>
                <span className="text-emerald-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onGoToPOS();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Proceed to Full POS Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
