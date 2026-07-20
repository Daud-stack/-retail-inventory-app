import { describe, it, expect } from 'vitest';
import { 
  executeCheckoutInvoice, 
  recordStockAdjustment, 
  getCriticalAlerts 
} from '../services/inventoryEngine';

describe('Inventory State & QA Verification Suite', () => {
  const sampleProducts = [
    {
      id: 'prod-101',
      sku: 'CLN-101',
      name: 'Denim Jacket',
      category: 'Clothing',
      price: 80.00,
      cost: 40.00,
      stock: 20,
      minStock: 5,
      unit: 'pcs'
    },
    {
      id: 'prod-102',
      sku: 'GRO-202',
      name: 'Organic Milk',
      category: 'Groceries',
      price: 4.00,
      cost: 2.00,
      stock: 15,
      minStock: 10,
      expiryDate: '2026-07-25', // Expiring in 5 days (under 14 days)
      unit: 'carton'
    },
    {
      id: 'prod-103',
      sku: 'GRO-203',
      name: 'Artisan Bread',
      category: 'Groceries',
      price: 5.00,
      cost: 2.00,
      stock: 2, // Low stock (<= minStock 5)
      minStock: 5,
      expiryDate: '2026-08-30', // Far in future
      unit: 'loaf'
    },
    {
      id: 'prod-104',
      sku: 'MSC-304',
      name: 'Wireless Earbuds',
      category: 'Miscellaneous',
      price: 50.00,
      cost: 20.00,
      stock: 30,
      minStock: 5,
      unit: 'box'
    }
  ];

  // =========================================================================
  // TEST SEQUENCE 1: Checkout Stock Deduction Verification
  // =========================================================================
  describe('Test Sequence 1: Checkout Stock Deduction', () => {
    it('should correctly subtract item quantities from current_stock upon successful invoice checkout', () => {
      const cart = [
        { id: 'prod-101', name: 'Denim Jacket', price: 80.00, qty: 3, sku: 'CLN-101' },
        { id: 'prod-104', name: 'Wireless Earbuds', price: 50.00, qty: 5, sku: 'MSC-304' }
      ];

      const invoiceMeta = {
        invoiceId: 'INV-TEST-001',
        customer: 'John Doe',
        dateIso: '2026-07-20T14:00:00.000Z'
      };

      const result = executeCheckoutInvoice(sampleProducts, cart, invoiceMeta, []);

      // Verify Denim Jacket stock: 20 - 3 = 17
      const jacket = result.products.find(p => p.id === 'prod-101');
      expect(jacket.stock).toBe(17);

      // Verify Earbuds stock: 30 - 5 = 25
      const earbuds = result.products.find(p => p.id === 'prod-104');
      expect(earbuds.stock).toBe(25);

      // Verify unaffected product stock remains unchanged
      const milk = result.products.find(p => p.id === 'prod-102');
      expect(milk.stock).toBe(15);
    });

    it('should throw an error when attempting to checkout more items than current available stock', () => {
      const excessiveCart = [
        { id: 'prod-103', name: 'Artisan Bread', price: 5.00, qty: 10, sku: 'GRO-203' } // Stock is 2
      ];

      expect(() => {
        executeCheckoutInvoice(sampleProducts, excessiveCart, { invoiceId: 'INV-ERR' }, []);
      }).toThrow(/Insufficient stock/i);
    });

    it('should throw an error when attempting to execute checkout with an empty cart', () => {
      expect(() => {
        executeCheckoutInvoice(sampleProducts, [], { invoiceId: 'INV-ERR' }, []);
      }).toThrow(/empty cart/i);
    });
  });

  // =========================================================================
  // TEST SEQUENCE 2: Stock Movements Audit Ledger Logging
  // =========================================================================
  describe('Test Sequence 2: Stock Movements Audit Ledger Logging', () => {
    it('should trigger a background write to stock_movements ledger with matching timestamp upon checkout sale', () => {
      const cart = [{ id: 'prod-101', name: 'Denim Jacket', price: 80.00, qty: 2, sku: 'CLN-101' }];
      const invoiceMeta = {
        invoiceId: 'INV-TEST-888',
        customer: 'Jane Smith',
        dateIso: '2026-07-20T14:15:00.000Z'
      };

      const result = executeCheckoutInvoice(sampleProducts, cart, invoiceMeta, []);

      expect(result.stockMovements).toHaveLength(1);
      const log = result.stockMovements[0];

      expect(log.productId).toBe('prod-101');
      expect(log.movementType).toBe('Sale');
      expect(log.quantityChange).toBe(-2);
      expect(log.previousStock).toBe(20);
      expect(log.newStock).toBe(18);
      expect(log.referenceId).toBe('INV-TEST-888');
      expect(log.timestamp).toBe('2026-07-20T14:15:00.000Z');
    });

    it('should log stock adjustments (Restock, Spoilage, Manual Adjustment) with precise timestamps', () => {
      // Test Restock (+15)
      const restockRes = recordStockAdjustment(sampleProducts, 'prod-101', 35, 'Restock', 'PO-Supplier-99', []);
      expect(restockRes.products.find(p => p.id === 'prod-101').stock).toBe(35);
      
      const restockLog = restockRes.stockMovements[0];
      expect(restockLog.movementType).toBe('Restock');
      expect(restockLog.quantityChange).toBe(15);
      expect(restockLog.previousStock).toBe(20);
      expect(restockLog.newStock).toBe(35);
      expect(restockLog.notes).toContain('PO-Supplier-99');
      expect(restockLog.timestamp).toBeDefined();

      // Test Spoilage (-2)
      const spoilRes = recordStockAdjustment(sampleProducts, 'prod-102', 13, 'Spoilage', 'Broken packaging', []);
      const spoilLog = spoilRes.stockMovements[0];
      expect(spoilLog.movementType).toBe('Spoilage');
      expect(spoilLog.quantityChange).toBe(-2);
      expect(spoilLog.previousStock).toBe(15);
      expect(spoilLog.newStock).toBe(13);
    });
  });

  // =========================================================================
  // TEST SEQUENCE 3: Dynamic Critical Alerts Radar
  // =========================================================================
  describe('Test Sequence 3: Dynamic Critical Alerts Radar', () => {
    it('should dynamically populate Critical Alerts for products with stock <= reorder_level or expiry < 14 days', () => {
      const referenceDate = '2026-07-20T00:00:00.000Z';
      const alerts = getCriticalAlerts(sampleProducts, referenceDate);

      // prod-102 (Milk) has expiry 2026-07-25 (5 days away < 14 days) -> Critical Alert!
      // prod-103 (Bread) has stock 2 <= minStock 5 -> Critical Alert!
      expect(alerts).toHaveLength(2);

      const alertSkus = alerts.map(a => a.sku);
      expect(alertSkus).toContain('GRO-202');
      expect(alertSkus).toContain('GRO-203');

      // Unaffected products (Denim Jacket stock 20, Earbuds stock 30) should NOT be in alerts
      expect(alertSkus).not.toContain('CLN-101');
      expect(alertSkus).not.toContain('MSC-304');
    });

    it('should correctly label EXPIRING_SOON and LOW_STOCK urgency types', () => {
      const referenceDate = '2026-07-20T00:00:00.000Z';
      const alerts = getCriticalAlerts(sampleProducts, referenceDate);

      const milkAlert = alerts.find(a => a.id === 'prod-102');
      expect(milkAlert.isNearExpiry).toBe(true);
      expect(milkAlert.daysUntilExpiry).toBe(5);
      expect(milkAlert.alertType).toBe('EXPIRING_SOON');

      const breadAlert = alerts.find(a => a.id === 'prod-103');
      expect(breadAlert.isLowOrEmpty).toBe(true);
      expect(breadAlert.alertType).toBe('LOW_STOCK');
    });
  });
});
