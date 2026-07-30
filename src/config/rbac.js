/**
 * ROLE-BASED ACCESS CONTROL (RBAC) CONFIGURATION
 * Defines user roles, permissions matrix, and access guard utilities.
 */

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  CLERK: 'Stock Clerk'
};

export const PERMISSIONS = {
  VIEW_SUPER_ADMIN: 'view_super_admin',
  MANAGE_TENANTS: 'manage_tenants',
  MANAGE_LICENSES: 'manage_licenses',
  MANAGE_GLOBAL_CONFIG: 'manage_global_config',
  VIEW_SYSTEM_HEALTH: 'view_system_health',
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_FINANCIALS: 'view_financials',
  VIEW_PRODUCTS: 'view_products',
  ADD_PRODUCT: 'add_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  EDIT_PRICING: 'edit_pricing',
  RESTOCK_ITEM: 'restock_item',
  EXECUTE_POS: 'execute_pos',
  MANAGE_USERS: 'manage_users',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_CUSTOMERS: 'manage_customers',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  MANAGE_DATA: 'manage_data'
};

// Permission Mapping matrix for each user role
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_SUPER_ADMIN,
    PERMISSIONS.MANAGE_TENANTS,
    PERMISSIONS.MANAGE_LICENSES,
    PERMISSIONS.MANAGE_GLOBAL_CONFIG,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.EDIT_PRICING,
    PERMISSIONS.RESTOCK_ITEM,
    PERMISSIONS.EXECUTE_POS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.MANAGE_DATA
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.EDIT_PRICING,
    PERMISSIONS.RESTOCK_ITEM,
    PERMISSIONS.EXECUTE_POS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.MANAGE_DATA
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.EDIT_PRICING,
    PERMISSIONS.RESTOCK_ITEM,
    PERMISSIONS.EXECUTE_POS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_SUPPLIERS
  ],
  [ROLES.CASHIER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EXECUTE_POS,
    PERMISSIONS.MANAGE_CUSTOMERS
  ],
  [ROLES.CLERK]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.RESTOCK_ITEM
  ]
};

// Default initial user profiles for the system
export const INITIAL_USERS = [
  {
    id: 'usr-0',
    name: 'Super Admin Account',
    email: 'superadmin@nexusretail.com',
    role: ROLES.SUPER_ADMIN,
    pin: '9999',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'Active'
  },
  {
    id: 'usr-1',
    name: 'Admin Account',
    email: 'admin@nexusretail.com',
    role: ROLES.ADMIN,
    pin: '1234',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'Active'
  },
  {
    id: 'usr-2',
    name: 'Store Manager Account',
    email: 'manager@nexusretail.com',
    role: ROLES.MANAGER,
    pin: '2222',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'Active'
  },
  {
    id: 'usr-3',
    name: 'Cashier Account',
    email: 'cashier@nexusretail.com',
    role: ROLES.CASHIER,
    pin: '3333',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'Active'
  },
  {
    id: 'usr-4',
    name: 'Stock Clerk Account',
    email: 'clerk@nexusretail.com',
    role: ROLES.CLERK,
    pin: '4444',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'Active'
  }
];

/**
 * Checks if a user role has a specific permission.
 */
export function hasPermission(role, permission) {
  if (!role) return false;
  if (role === ROLES.SUPER_ADMIN) return true; // Super Admin has 100% unrestricted access to everything
  if (!ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
