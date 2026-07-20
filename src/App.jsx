import React, { useState } from 'react';
import { INITIAL_PRODUCTS } from './data/mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import POSCart from './components/POSCart';
import ReceiptModal from './components/ReceiptModal';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  // Modals & Form States
  const [editingProduct, setEditingProduct] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptMeta, setReceiptMeta] = useState(null);

  // Derived low stock count
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const totalCartUnits = cart.reduce((acc, item) => acc + item.qty, 0);

  // Handlers
  const handleRestockItem = (id, amount = 10) => {
    setProducts(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, stock: item.stock + amount, lastRestocked: new Date().toISOString().split('T')[0] };
      }
      return item;
    }));
  };

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      alert('Item is currently out of stock!');
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Maximum available stock reached (${product.stock} units).`);
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

  const handleSaveProduct = (savedProduct) => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === savedProduct.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = savedProduct;
        return updated;
      } else {
        return [savedProduct, ...prev];
      }
    });
  };

  // Barcode Scanner completion handler
  const handleScanComplete = (sku, detectedProduct) => {
    if (activeTab === 'pos' && detectedProduct) {
      handleAddToCart(detectedProduct);
    } else {
      setScannedBarcode(sku);
      if (detectedProduct) {
        setEditingProduct(detectedProduct);
      }
      if (activeTab !== 'add-product') {
        setActiveTab('add-product');
      }
    }
  };

  // Generate Receipt Trigger
  const handleGenerateReceipt = (meta) => {
    setReceiptMeta(meta);
    setIsReceiptOpen(true);
  };

  // Finalize Checkout & Deduct Inventory Stock
  const handleFinalizeCheckout = () => {
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        }
        return p;
      });
    });
    setCart([]);
    setIsReceiptOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        cartCount={totalCartUnits}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          lowStockCount={lowStockCount}
          cartCount={totalCartUnits}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* Dynamic Section Renderer */}
        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products}
              onRestockItem={handleRestockItem}
              setActiveTab={setActiveTab}
              setSelectedCategoryFilter={setSelectedCategoryFilter}
            />
          )}

          {activeTab === 'products' && (
            <ProductList 
              products={products}
              selectedCategoryFilter={selectedCategoryFilter}
              setSelectedCategoryFilter={setSelectedCategoryFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onRestockItem={handleRestockItem}
              onAddToCart={handleAddToCart}
              onEditProduct={(p) => setEditingProduct(p)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'add-product' && (
            <ProductForm 
              onSaveProduct={handleSaveProduct}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              onOpenScanner={() => setIsScannerOpen(true)}
              scannedBarcode={scannedBarcode}
              setScannedBarcode={setScannedBarcode}
            />
          )}

          {activeTab === 'pos' && (
            <POSCart 
              products={products}
              cart={cart}
              setCart={setCart}
              onGenerateReceipt={handleGenerateReceipt}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Barcode Scanner Viewfinder Modal */}
      <BarcodeScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
        existingProducts={products}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        cart={cart}
        invoiceMeta={receiptMeta}
        onFinalizeCheckout={handleFinalizeCheckout}
      />
    </div>
  );
}
