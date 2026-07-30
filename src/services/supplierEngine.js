// src/services/supplierEngine.js
const SUPPLIER_STORAGE_KEY = 'nexus_suppliers';
const PO_STORAGE_KEY = 'nexus_purchase_orders';

const defaultSuppliers = [
  { id: 'sup-1', name: 'Harare Wholesale Distributors', contactPerson: 'Farai Chiweshe', email: 'orders@hwd.co.zw', phone: '+263 242 700100', categories: ['Groceries', 'Beverages'], rating: 4.8, leadTimeDays: 2, status: 'Active' },
  { id: 'sup-2', name: 'ZimTextiles Ltd', contactPerson: 'Grace Mutasa', email: 'sales@zimtextiles.co.zw', phone: '+263 292 600200', categories: ['Clothing'], rating: 4.5, leadTimeDays: 5, status: 'Active' }
];

let suppliers = [];
let purchaseOrders = [];

const loadData = () => {
  const storedSuppliers = localStorage.getItem(SUPPLIER_STORAGE_KEY);
  if (storedSuppliers) {
    suppliers = JSON.parse(storedSuppliers);
  } else {
    suppliers = [...defaultSuppliers];
    saveSuppliers();
  }

  const storedPOs = localStorage.getItem(PO_STORAGE_KEY);
  if (storedPOs) {
    purchaseOrders = JSON.parse(storedPOs);
  }
};

const saveSuppliers = () => {
  localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliers));
};

const savePOs = () => {
  localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(purchaseOrders));
};

// Supplier functions
export const getSuppliers = () => {
  if (suppliers.length === 0) loadData();
  return [...suppliers];
};

export const addSupplier = (data) => {
  const newSupplier = {
    id: `sup-${Date.now()}`,
    status: 'Active',
    ...data
  };
  suppliers.push(newSupplier);
  saveSuppliers();
  return newSupplier;
};

export const updateSupplier = (id, data) => {
  const index = suppliers.findIndex(s => s.id === id);
  if (index !== -1) {
    suppliers[index] = { ...suppliers[index], ...data };
    saveSuppliers();
    return suppliers[index];
  }
  return null;
};

export const deleteSupplier = (id) => {
  suppliers = suppliers.filter(s => s.id !== id);
  saveSuppliers();
};

// PO functions
export const getPurchaseOrders = () => {
  if (purchaseOrders.length === 0 && suppliers.length === 0) loadData();
  return [...purchaseOrders];
};

export const createPurchaseOrder = (poData) => {
  const newPO = {
    id: `po-${Date.now()}`,
    status: 'Draft',
    dateCreated: new Date().toISOString().split('T')[0],
    ...poData
  };
  purchaseOrders.push(newPO);
  savePOs();
  return newPO;
};

export const updatePOStatus = (id, newStatus, onRestockProduct = null) => {
  const validStatuses = ['Draft', 'Sent', 'Confirmed', 'Received', 'Cancelled'];
  if (!validStatuses.includes(newStatus)) return null;

  const index = purchaseOrders.findIndex(po => po.id === id);
  if (index !== -1) {
    const prevStatus = purchaseOrders[index].status;
    purchaseOrders[index].status = newStatus;
    
    // If order transitioned to Received, restock items in inventory
    if (newStatus === 'Received' && prevStatus !== 'Received' && onRestockProduct && purchaseOrders[index].items) {
      purchaseOrders[index].items.forEach(item => {
        if (item.productId && item.quantity) {
          onRestockProduct(item.productId, item.quantity);
        }
      });
    }
    
    savePOs();
    return purchaseOrders[index];
  }
  return null;
};

export const generatePOFromLowStock = (products) => {
    const lowStockProducts = products.filter(p => p.stock <= (p.minStock ?? p.lowStockThreshold ?? 10));
    if (lowStockProducts.length === 0) return [];
    
    // Grouping by category to map to suppliers
    const groupedPOs = {};
    
    lowStockProducts.forEach(product => {
        // Find a supplier that handles this category
        const supplier = suppliers.find(s => s.categories.includes(product.category)) || suppliers[0] || { id: 'sup-1', name: 'General Distributor' };
        
        if (!groupedPOs[supplier.id]) {
            groupedPOs[supplier.id] = {
                supplierId: supplier.id,
                items: [],
                totalValue: 0
            };
        }
        
        const threshold = product.minStock ?? product.lowStockThreshold ?? 10;
        const orderQty = Math.max((threshold * 2) - product.stock, 10);
        const itemCost = product.price ? product.price * 0.6 : 10; // 40% margin estimate
        
        groupedPOs[supplier.id].items.push({
            productId: product.id,
            name: product.name,
            quantity: orderQty,
            unitCost: itemCost
        });
        
        groupedPOs[supplier.id].totalValue += (orderQty * itemCost);
    });

    const newPOs = [];
    Object.values(groupedPOs).forEach(poData => {
        newPOs.push(createPurchaseOrder(poData));
    });

    return newPOs;
};

// Initialize
loadData();

