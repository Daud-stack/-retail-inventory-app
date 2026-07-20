-- ==============================================================================
-- MIGRATION 03: ROLE-BASED ACCESS CONTROL (RBAC) & USER MANAGEMENT
-- Database Target: Neon Serverless PostgreSQL
-- ==============================================================================

-- 1. Create User Roles Enum
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('Admin', 'Manager', 'Cashier', 'Stock Clerk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS system_users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role user_role_type NOT NULL DEFAULT 'Cashier',
    pin_code VARCHAR(10) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Role Permissions Matrix Table
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role user_role_type NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role, permission)
);

-- 4. Seed Initial Users
INSERT INTO system_users (id, full_name, email, role, pin_code, status) VALUES
('usr-1', 'Sarah Jenkins', 'sarah.admin@nexusretail.com', 'Admin', '1234', TRUE),
('usr-2', 'Marcus Vance', 'marcus.mgr@nexusretail.com', 'Manager', '2222', TRUE),
('usr-3', 'Elena Rostova', 'elena.pos@nexusretail.com', 'Cashier', '3333', TRUE),
('usr-4', 'David Miller', 'david.clerk@nexusretail.com', 'Stock Clerk', '4444', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 5. Seed Permissions Matrix
INSERT INTO role_permissions (role, permission) VALUES
('Admin', 'view_dashboard'),
('Admin', 'view_financials'),
('Admin', 'view_products'),
('Admin', 'add_product'),
('Admin', 'edit_product'),
('Admin', 'delete_product'),
('Admin', 'edit_pricing'),
('Admin', 'restock_item'),
('Admin', 'execute_pos'),
('Admin', 'manage_users'),
('Admin', 'view_audit_logs'),

('Manager', 'view_dashboard'),
('Manager', 'view_financials'),
('Manager', 'view_products'),
('Manager', 'add_product'),
('Manager', 'edit_product'),
('Manager', 'edit_pricing'),
('Manager', 'restock_item'),
('Manager', 'execute_pos'),
('Manager', 'view_audit_logs'),

('Cashier', 'view_products'),
('Cashier', 'execute_pos'),

('Stock Clerk', 'view_products'),
('Stock Clerk', 'add_product'),
('Stock Clerk', 'edit_product'),
('Stock Clerk', 'restock_item')
ON CONFLICT (role, permission) DO NOTHING;

-- 6. Indexes for Fast Auth Queries
CREATE INDEX IF NOT EXISTS idx_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON system_users(role);
