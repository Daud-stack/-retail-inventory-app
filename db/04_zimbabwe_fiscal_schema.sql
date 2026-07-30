-- Phase 4: Zimbabwe Fiscalization & Multi-tenant Schema Extension
-- Filename: 04_zimbabwe_fiscal_schema.sql

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE,
    zimra_bpn VARCHAR(50),
    vat_number VARCHAR(50),
    currency_preference VARCHAR(10) DEFAULT 'ZIG', -- 'ZIG' or 'USD'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    tier VARCHAR(50) DEFAULT 'Standard',
    points INT DEFAULT 0,
    total_spent DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    rating INT CHECK (rating >= 0 AND rating <= 5) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Sent, Received, Cancelled
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Fiscal Z-Reports Table (ZIMRA Compliance)
CREATE TABLE IF NOT EXISTS fiscal_z_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    total_zig_sales DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_usd_sales DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    vat_zig DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    vat_usd DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    transaction_count INT NOT NULL DEFAULT 0,
    raw_zimra_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Row Level Security (RLS) Policies Template

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_z_reports ENABLE ROW LEVEL SECURITY;

-- Note: The current_tenant_id should be set via a custom configuration parameter 
-- e.g., set_config('app.current_tenant', 'tenant-uuid', true) in the database session.

CREATE POLICY tenant_isolation_customers 
    ON customers 
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_suppliers 
    ON suppliers 
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_purchase_orders 
    ON purchase_orders 
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_fiscal_z_reports 
    ON fiscal_z_reports 
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
