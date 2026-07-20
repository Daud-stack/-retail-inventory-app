/**
 * INVENTORY ENGINE SERVICE
 * Handles core business logic for:
 * 1. Checkout Stock Deduction & Invoice Execution
 * 2. Stock Adjustment Audit Logging (stock_movements ledger)
 * 3. Dynamic Critical Alerts Evaluation (Stock Threshold & Expiry < 14 Days)
 */

/**
 * Executes checkout invoice: deducts cart quantities from products inventory
 * and records matching 'Sale' entries in the stock_movements ledger.
 */
export function executeCheckoutInvoice(products, cartItems, invoiceMeta, stockMovements = []) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot process checkout with an empty cart.');
  }

  const timestamp = invoiceMeta?.dateIso || new Date().toISOString();
  const updatedProducts = [...products];
  const newMovements = [...stockMovements];

  cartItems.forEach(cartItem => {
    const prodIndex = updatedProducts.findIndex(p => p.id === cartItem.id);
    if (prodIndex === -1) {
      throw new Error(`Product with ID ${cartItem.id} not found in inventory.`);
    }

    const currentProd = updatedProducts[prodIndex];
    if (currentProd.stock < cartItem.qty) {
      throw new Error(`Insufficient stock for ${currentProd.name}. Requested: ${cartItem.qty}, Available: ${currentProd.stock}`);
    }

    const previousStock = currentProd.stock;
    const newStock = previousStock - cartItem.qty;

    // Deduct stock count
    updatedProducts[prodIndex] = {
      ...currentProd,
      stock: newStock
    };

    // Record audit movement log
    newMovements.push({
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: currentProd.id,
      productName: currentProd.name,
      sku: currentProd.sku,
      movementType: 'Sale',
      quantityChange: -cartItem.qty,
      previousStock,
      newStock,
      referenceId: invoiceMeta?.invoiceId || 'INV-UNKNOWN',
      notes: `POS Sale to ${invoiceMeta?.customer || 'Walk-in Customer'}`,
      timestamp
    });
  });

  return {
    products: updatedProducts,
    stockMovements: newMovements
  };
}

/**
 * Adjusts stock quantity for a product (Restock, Spoilage, Manual Adjustment)
 * and writes a background audit entry to stock_movements ledger.
 */
export function recordStockAdjustment(products, productId, newStockCount, reason = 'Adjustment', notes = '', stockMovements = []) {
  const prodIndex = products.findIndex(p => p.id === productId);
  if (prodIndex === -1) {
    throw new Error(`Product with ID ${productId} not found.`);
  }

  const currentProd = products[prodIndex];
  const previousStock = currentProd.stock;
  const quantityChange = newStockCount - previousStock;
  const timestamp = new Date().toISOString();

  const updatedProducts = [...products];
  updatedProducts[prodIndex] = {
    ...currentProd,
    stock: newStockCount,
    lastRestocked: reason === 'Restock' ? timestamp.split('T')[0] : currentProd.lastRestocked
  };

  const auditMovement = {
    id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    productId: currentProd.id,
    productName: currentProd.name,
    sku: currentProd.sku,
    movementType: reason, // 'Restock' | 'Sale' | 'Spoilage' | 'Adjustment'
    quantityChange,
    previousStock,
    newStock: newStockCount,
    referenceId: `ADJ-${Date.now().toString().slice(-6)}`,
    notes: notes || `Stock adjusted via ${reason}`,
    timestamp
  };

  return {
    products: updatedProducts,
    stockMovements: [auditMovement, ...stockMovements]
  };
}

/**
 * Evaluates inventory to dynamically populate Critical Alerts List:
 * - Stock count <= reorder_level (Low Stock or Out of Stock)
 * - Expiry date within 14 days from current date (or already expired)
 */
export function getCriticalAlerts(products, referenceDateStr = null) {
  const referenceDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  return products.filter(product => {
    // 1. Stock threshold check
    const isLowOrEmpty = product.stock <= (product.minStock !== undefined ? product.minStock : 5);

    // 2. Expiry date check (< 14 days)
    let isNearExpiry = false;
    if (product.expiry_date || product.expiryDate) {
      const expDate = new Date(product.expiry_date || product.expiryDate);
      const diffMs = expDate.getTime() - referenceDate.getTime();
      if (diffMs <= fourteenDaysMs) {
        isNearExpiry = true;
      }
    }

    return isLowOrEmpty || isNearExpiry;
  }).map(product => {
    const isLowOrEmpty = product.stock <= (product.minStock !== undefined ? product.minStock : 5);
    
    let isNearExpiry = false;
    let daysUntilExpiry = null;
    if (product.expiry_date || product.expiryDate) {
      const expDate = new Date(product.expiry_date || product.expiryDate);
      const diffMs = expDate.getTime() - referenceDate.getTime();
      daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffMs <= fourteenDaysMs) {
        isNearExpiry = true;
      }
    }

    // Determine alert urgency type
    let alertType = 'LOW_STOCK';
    let alertLabel = `Low Stock (${product.stock} left)`;

    if (product.stock === 0) {
      alertType = 'OUT_OF_STOCK';
      alertLabel = 'Out of Stock';
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 0) {
      alertType = 'EXPIRED';
      alertLabel = `Expired (${Math.abs(daysUntilExpiry)} days ago)`;
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 14) {
      alertType = 'EXPIRING_SOON';
      alertLabel = `Expiring in ${daysUntilExpiry} days`;
    }

    return {
      ...product,
      alertType,
      alertLabel,
      daysUntilExpiry,
      isLowOrEmpty,
      isNearExpiry
    };
  });
}
