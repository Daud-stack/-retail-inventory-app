-- =============================================================================
-- NEXUS RETAIL INVENTORY MANAGEMENT DATABASE MIGRATION SCRIPT
-- Optimized for PostgreSQL / Neon Serverless Database
-- =============================================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUM TYPES & CLEANUP (Optional reset)
-- DROP TABLE IF EXISTS stock_movements CASCADE;
-- DROP TABLE IF EXISTS invoice_items CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS pricing CASCADE;
-- DROP TABLE IF EXISTS inventory CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode_sku TEXT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Clothing', 'Groceries', 'Miscellaneous')),
    description TEXT,
    supplier VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for rapid SKU lookups from scanner
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(barcode_sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 5 CHECK (reorder_level >= 0),
    expiry_date DATE, -- Relevant for Groceries category
    size_color_variant VARCHAR(100), -- Relevant for Clothing category (e.g., 'Size L / Blue Denim')
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
    location VARCHAR(100) DEFAULT 'Main Warehouse',
    last_restocked TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reorder ON inventory(current_stock, reorder_level);

-- 4. PRICING TABLE
CREATE TABLE IF NOT EXISTS pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (selling_price >= 0),
    margin_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN selling_price > 0 THEN ((selling_price - cost_price) / selling_price) * 100 
            ELSE 0 
        END
    ) STORED,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_product_id ON pricing(product_id);

-- 5. INVOICES TABLE (POS Transactions)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Credit Card' CHECK (payment_method IN ('Credit Card', 'Cash', 'Mobile / NFC', 'Store Credit')),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 8.00 CHECK (tax_rate >= 0),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- 6. INVOICE ITEMS TABLE (Line Items)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);

-- 7. STOCK MOVEMENTS AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('Sale', 'Restock', 'Spoilage', 'Adjustment', 'Return')),
    quantity_change INTEGER NOT NULL, -- Positive for restocks, negative for sales/spoilage
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id TEXT, -- Invoice ID or Restock PO number
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at DESC);

-- 8. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();
