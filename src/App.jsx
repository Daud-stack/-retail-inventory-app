import React, { useState } from 'react';
import { INITIAL_PRODUCTS, MOCK_RECENT_TRANSACTIONS } from './data/mockData';
import { INITIAL_USERS, ROLES } from './config/rbac';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import POSCart from './components/POSCart';
import ReceiptModal from './components/ReceiptModal';
import QuickCartDrawer from './components/QuickCartDrawer';
import UserManagementModal from './components/UserManagementModal';
import ForecastingView from './components/ForecastingView';
import DataScienceAnalyticsView from './components/DataScienceAnalyticsView';
import SuperAdminCommandCenter from './components/SuperAdminCommandCenter';
import { executeCheckoutInvoice } from './services/inventoryEngine';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState(MOCK_RECENT_TRANSACTIONS);
  const [stockMovements, setStockMovements] = useState([]);
  
  // RBAC User Accounts State
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Alex Thorne (Super Admin)
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('superadmin');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  // Modals & Mobile Drawer States
  const [editingProduct, setEditingProduct] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickCartOpen, setIsQuickCartOpen] = useState(false);
  
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

  const handleCreateUser = (newUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleSwitchUser = (selectedUser) => {
    setCurrentUser(selectedUser);
    if (selectedUser.role === ROLES.SUPER_ADMIN) {
      setActiveTab('superadmin');
    }
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

  // Finalize Checkout, Deduct Inventory Stock & Log Movements
  const handleFinalizeCheckout = (meta) => {
    const activeMeta = meta || receiptMeta;
    if (!activeMeta || cart.length === 0) return;

    try {
      const res = executeCheckoutInvoice(products, cart, activeMeta, stockMovements);
      setProducts(res.products);
      setStockMovements(res.stockMovements);

      const newTx = {
        id: activeMeta.invoiceId,
        customer: activeMeta.customer || 'Walk-in Customer',
        itemsCount: cart.reduce((acc, item) => acc + item.qty, 0),
        total: activeMeta.total,
        date: 'Just Now',
        status: 'Completed'
      };

      setTransactions([newTx, ...transactions]);
      setCart([]);
      setIsReceiptOpen(false);
    } catch (err) {
      console.error('Checkout finalization error:', err);
      alert(`Checkout Error: ${err.message}`);
    }
  };

  // Dedicated Super Admin View Mode
  if (activeTab === 'superadmin') {
    return (
      <div className="h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
        <SuperAdminCommandCenter 
          currentUser={currentUser} 
          onSwitchUser={handleSwitchUser} 
          setActiveTab={setActiveTab} 
        />
        <UserManagementModal 
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          users={users}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onCreateUser={handleCreateUser}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        cartCount={totalCartUnits}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={totalCartUnits}
          currentUser={currentUser}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickCart={() => setIsQuickCartOpen(true)}
        />

        {/* Dynamic Section Renderer */}
        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products}
              onRestockItem={handleRestockItem}
              setActiveTab={setActiveTab}
              setSelectedCategoryFilter={setSelectedCategoryFilter}
              currentUser={currentUser}
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
              currentUser={currentUser}
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
              currentUser={currentUser}
            />
          )}

          {activeTab === 'forecasting' && (
            <ForecastingView 
              products={products}
              onRestockItem={handleRestockItem}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'datascience' && (
            <DataScienceAnalyticsView 
              products={products}
              onAddToCart={handleAddToCart}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'pos' && (
            <POSCart 
              products={products}
              cart={cart}
              setCart={setCart}
              onGenerateReceipt={handleGenerateReceipt}
              onOpenScanner={() => setIsScannerOpen(true)}
              transactions={transactions}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* User Management & Role Switcher Modal */}
      <UserManagementModal 
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={users}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onCreateUser={handleCreateUser}
      />

      {/* Quick Cart Drawer Overlay */}
      <QuickCartDrawer 
        isOpen={isQuickCartOpen}
        onClose={() => setIsQuickCartOpen(false)}
        cart={cart}
        setCart={setCart}
        onGoToPOS={() => setActiveTab('pos')}
        products={products}
      />

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
