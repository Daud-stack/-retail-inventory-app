import React, { useState } from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { INITIAL_PRODUCTS, MOCK_RECENT_TRANSACTIONS } from './data/mockData';
import { INITIAL_USERS, ROLES, PERMISSIONS, hasPermission } from './config/rbac';
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
import LoginModal from './components/LoginModal';
import { executeCheckoutInvoice } from './services/inventoryEngine';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState(MOCK_RECENT_TRANSACTIONS);
  const [stockMovements, setStockMovements] = useState([]);
  
  // Authentication & RBAC State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Alex Thorne (Super Admin)
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSwitchUser = (selectedUser) => {
    setCurrentUser(selectedUser);
    setIsUserManagementOpen(false);
    if (selectedUser.role === ROLES.SUPER_ADMIN) {
      setActiveTab('superadmin');
    } else if (selectedUser.role === ROLES.CASHIER) {
      setActiveTab('pos');
    } else if (selectedUser.role === ROLES.CLERK) {
      setActiveTab('products');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
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

  // Derive safe, permission-guarded active tab for current user role
  const effectiveTab = (activeTab === 'superadmin' && hasPermission(currentUser?.role, PERMISSIONS.VIEW_SUPER_ADMIN))
    ? 'superadmin'
    : (activeTab === 'superadmin'
        ? (currentUser?.role === ROLES.CASHIER ? 'pos' : currentUser?.role === ROLES.CLERK ? 'products' : 'dashboard')
        : activeTab);

  // Unauthenticated Guard Screen
  if (!isLoggedIn) {
    return (
      <LoginModal 
        users={users} 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          if (user.role === ROLES.SUPER_ADMIN) {
            setActiveTab('superadmin');
          } else if (user.role === ROLES.CASHIER) {
            setActiveTab('pos');
          } else if (user.role === ROLES.CLERK) {
            setActiveTab('products');
          } else {
            setActiveTab('dashboard');
          }
        }} 
      />
    );
  }

  // Dedicated Super Admin View Mode for Authorized Super Admins
  if (effectiveTab === 'superadmin') {
    return (
      <div className="h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
        <SuperAdminCommandCenter 
          currentUser={currentUser} 
          onSwitchUser={handleSwitchUser} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
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
        activeTab={effectiveTab}
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
          activeTab={effectiveTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={totalCartUnits}
          currentUser={currentUser}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickCart={() => setIsQuickCartOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Section Renderer */}
        <main className="flex-1 pb-12">
          {effectiveTab === 'dashboard' && (
            hasPermission(currentUser?.role, PERMISSIONS.VIEW_DASHBOARD) ? (
              <Dashboard 
                products={products}
                onRestockItem={handleRestockItem}
                setActiveTab={setActiveTab}
                setSelectedCategoryFilter={setSelectedCategoryFilter}
                currentUser={currentUser}
              />
            ) : (
              <AccessRestrictedBanner 
                role={currentUser?.role} 
                tabName="Dashboard & Financial Analytics" 
                onNavigate={() => setActiveTab(currentUser?.role === ROLES.CASHIER ? 'pos' : 'products')}
                onLogout={handleLogout}
              />
            )
          )}

          {effectiveTab === 'products' && (
            hasPermission(currentUser?.role, PERMISSIONS.VIEW_PRODUCTS) ? (
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
            ) : (
              <AccessRestrictedBanner 
                role={currentUser?.role} 
                tabName="Product Catalog" 
                onNavigate={() => setActiveTab('pos')}
                onLogout={handleLogout}
              />
            )
          )}

          {effectiveTab === 'add-product' && (
            hasPermission(currentUser?.role, PERMISSIONS.ADD_PRODUCT) ? (
              <ProductForm 
                onSaveProduct={handleSaveProduct}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                onOpenScanner={() => setIsScannerOpen(true)}
                scannedBarcode={scannedBarcode}
                setScannedBarcode={setScannedBarcode}
                currentUser={currentUser}
              />
            ) : (
              <AccessRestrictedBanner 
                role={currentUser?.role} 
                tabName="Stock Manager & Add Product" 
                onNavigate={() => setActiveTab(currentUser?.role === ROLES.CASHIER ? 'pos' : 'products')}
                onLogout={handleLogout}
              />
            )
          )}

          {effectiveTab === 'forecasting' && (
            hasPermission(currentUser?.role, PERMISSIONS.VIEW_DASHBOARD) ? (
              <ForecastingView 
                products={products}
                onRestockItem={handleRestockItem}
                currentUser={currentUser}
              />
            ) : (
              <AccessRestrictedBanner 
                role={currentUser?.role} 
                tabName="Stock Demand Forecasting" 
                onNavigate={() => setActiveTab(currentUser?.role === ROLES.CASHIER ? 'pos' : 'products')}
                onLogout={handleLogout}
              />
            )
          )}

          {effectiveTab === 'datascience' && (
            hasPermission(currentUser?.role, PERMISSIONS.VIEW_FINANCIALS) ? (
              <DataScienceAnalyticsView 
                products={products}
                onAddToCart={handleAddToCart}
                setActiveTab={setActiveTab}
              />
            ) : (
              <AccessRestrictedBanner 
                role={currentUser?.role} 
                tabName="Retail Intelligence & Data Science" 
                onNavigate={() => setActiveTab(currentUser?.role === ROLES.CASHIER ? 'pos' : 'products')}
                onLogout={handleLogout}
              />
            )
          )}

          {effectiveTab === 'pos' && (
            hasPermission(currentUser?.role, PERMISSIONS.EXECUTE_POS) ? (
              <POSCart 
                products={products}
                cart={cart}
                setCart={setCart}
                onGenerateReceipt={handleGenerateReceipt}
                onOpenScanner={() => setIsScannerOpen(true)}
                transactions={transactions}
                currentUser={currentUser}
              />
            ) : (
              <AccessRestrictedBanner 
                role={currentUser?.role} 
                tabName="POS & Checkout Invoicing" 
                onNavigate={() => setActiveTab('products')}
                onLogout={handleLogout}
              />
            )
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

function AccessRestrictedBanner({ role, tabName, onNavigate, onLogout }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px] space-y-4 animate-fadeIn select-none">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-100">Access Restricted</h3>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
        Your account role (<strong className="text-red-400">{role}</strong>) does not have permission to view <span className="text-slate-200 font-semibold">{tabName}</span>.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onNavigate}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
        >
          Go to Allowed View
        </button>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs border border-red-500/30 transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
