import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Neon PostgreSQL Connection SQL Executor
const dbUrl = process.env.DATABASE_URL;
let sql = null;

if (dbUrl) {
  try {
    sql = neon(dbUrl);
  } catch (err) {
    console.warn('Neon DB connection initialization warning:', err.message);
  }
}

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Nexus Retail Inventory API',
    platform: 'Render Web Service',
    database: sql ? 'Neon Serverless Postgres (Connected)' : 'Neon DB URL Missing',
    timestamp: new Date().toISOString()
  });
});

// 2. GET All Products with Inventory & Pricing
app.get('/api/products', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database connection not configured. Set DATABASE_URL in Render environment.' });
  }

  try {
    const products = await sql`
      SELECT 
        p.id,
        p.barcode_sku AS "sku",
        p.name,
        p.category,
        p.description,
        p.supplier,
        i.current_stock AS "stock",
        i.reorder_level AS "minStock",
        i.expiry_date AS "expiryDate",
        i.size_color_variant AS "variant",
        i.unit,
        i.location,
        i.last_restocked AS "lastRestocked",
        pr.cost_price AS "cost",
        pr.selling_price AS "price",
        pr.margin_percentage AS "margin"
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN pricing pr ON p.id = pr.product_id
      ORDER BY p.name ASC
    `;
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products from Neon database.' });
  }
});

// 3. POST Add New Product
app.post('/api/products', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database connection not configured.' });
  }

  const { name, sku, category, price, cost, stock, minStock, supplier, location, unit, description } = req.body;

  if (!name || !sku || !price) {
    return res.status(400).json({ error: 'Missing required fields: name, sku, price.' });
  }

  try {
    // Insert Product
    const [prod] = await sql`
      INSERT INTO products (barcode_sku, name, category, description, supplier)
      VALUES (${sku}, ${name}, ${category || 'Clothing'}, ${description || ''}, ${supplier || 'Standard Distributor'})
      RETURNING id
    `;

    const productId = prod.id;

    // Insert Inventory
    await sql`
      INSERT INTO inventory (product_id, current_stock, reorder_level, unit, location)
      VALUES (${productId}, ${parseInt(stock, 10) || 0}, ${parseInt(minStock, 10) || 5}, ${unit || 'pcs'}, ${location || 'Warehouse Main'})
    `;

    // Insert Pricing
    await sql`
      INSERT INTO pricing (product_id, cost_price, selling_price)
      VALUES (${productId}, ${parseFloat(cost) || 0}, ${parseFloat(price) || 0})
    `;

    // Log Stock Movement
    await sql`
      INSERT INTO stock_movements (product_id, movement_type, quantity_change, previous_stock, new_stock, notes)
      VALUES (${productId}, 'Restock', ${parseInt(stock, 10) || 0}, 0, ${parseInt(stock, 10) || 0}, 'Initial product creation')
    `;

    res.status(201).json({ message: 'Product created successfully', id: productId });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product in database.' });
  }
});

// 4. POST POS Invoice Checkout & Stock Deduction
app.post('/api/checkout', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database connection not configured.' });
  }

  const { invoiceId, customerName, paymentMethod, subtotal, taxRate, taxAmount, discountAmount, totalAmount, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart items required for checkout.' });
  }

  try {
    // 1. Insert Invoice
    const [inv] = await sql`
      INSERT INTO invoices (invoice_number, customer_name, payment_method, subtotal, tax_rate, tax_amount, discount_amount, total_amount)
      VALUES (${invoiceId || `INV-${Date.now()}`}, ${customerName || 'Walk-in Customer'}, ${paymentMethod || 'Credit Card'}, ${subtotal}, ${taxRate || 8.0}, ${taxAmount}, ${discountAmount || 0}, ${totalAmount})
      RETURNING id
    `;

    // 2. Insert Invoice Items & Update Stock
    for (const item of items) {
      await sql`
        INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price)
        VALUES (${inv.id}, ${item.id}, ${item.qty}, ${item.price})
      `;

      // Get current stock
      const [invRecord] = await sql`
        SELECT current_stock FROM inventory WHERE product_id = ${item.id}
      `;

      const prevStock = invRecord ? invRecord.current_stock : item.qty;
      const newStock = Math.max(0, prevStock - item.qty);

      // Deduct stock
      await sql`
        UPDATE inventory SET current_stock = ${newStock} WHERE product_id = ${item.id}
      `;

      // Log movement
      await sql`
        INSERT INTO stock_movements (product_id, movement_type, quantity_change, previous_stock, new_stock, reference_id, notes)
        VALUES (${item.id}, 'Sale', ${-item.qty}, ${prevStock}, ${newStock}, ${invoiceId}, 'POS Checkout Sale')
      `;
    }

    res.status(200).json({ message: 'Checkout transaction processed', invoiceId: inv.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to complete checkout transaction.' });
  }
});

// 5. GET Audit Log Stock Movements
app.get('/api/movements', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database connection not configured.' });
  }

  try {
    const movements = await sql`
      SELECT 
        sm.id,
        sm.product_id AS "productId",
        p.name AS "productName",
        p.barcode_sku AS "sku",
        sm.movement_type AS "movementType",
        sm.quantity_change AS "quantityChange",
        sm.previous_stock AS "previousStock",
        sm.new_stock AS "newStock",
        sm.reference_id AS "referenceId",
        sm.notes,
        sm.created_at AS "timestamp"
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
      LIMIT 50
    `;
    res.json(movements);
  } catch (err) {
    console.error('Fetch movements error:', err);
    res.status(500).json({ error: 'Failed to fetch audit movements.' });
  }
});

app.listen(PORT, () => {
  console.log(`Render Backend API Service running on port ${PORT}`);
});
