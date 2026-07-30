/**
 * SUPER ADMIN MOCK DATA & CONFIGURATION
 * Multi-tenant store accounts, SaaS licensing, platform alerts, system health metrics.
 */

export const MOCK_TENANTS = [
  {
    id: 'tenant-1',
    name: 'Harare Primary School & Retail Store',
    code: 'HRE-001',
    location: 'Harare CBD, Zimbabwe',
    manager: 'Sarah Jenkins',
    email: 'harare.branch@nexusretail.com',
    status: 'Active',
    plan: 'Full',
    totalProducts: 4,
    totalStaff: 12,
    maxUsers: 15,
    monthlyRevenue: 14850.00,
    createdDate: '2025-01-15'
  },
  {
    id: 'tenant-2',
    name: 'Bulawayo Central Depot',
    code: 'BYO-002',
    location: 'Bulawayo Industrial Park',
    manager: 'Marcus Vance',
    email: 'bulawayo.depot@nexusretail.com',
    status: 'Active',
    plan: 'Enterprise',
    totalProducts: 850,
    totalStaff: 8,
    maxUsers: 50,
    monthlyRevenue: 22400.00,
    createdDate: '2025-03-20'
  },
  {
    id: 'tenant-3',
    name: 'Mutare Express Outlet',
    code: 'MTR-003',
    location: 'Mutare Central',
    manager: 'David Miller',
    email: 'mutare.express@nexusretail.com',
    status: 'Active',
    plan: 'Starter',
    totalProducts: 320,
    totalStaff: 5,
    maxUsers: 5,
    monthlyRevenue: 9800.00,
    createdDate: '2025-06-10'
  },
  {
    id: 'tenant-4',
    name: 'Gweru Hub Station',
    code: 'GWR-004',
    location: 'Gweru Mall',
    manager: 'Elena Rostova',
    email: 'gweru.hub@nexusretail.com',
    status: 'Pending Renewal',
    plan: 'Trial',
    totalProducts: 140,
    totalStaff: 3,
    maxUsers: 3,
    monthlyRevenue: 3400.00,
    createdDate: '2026-06-01'
  }
];

export const MOCK_LICENSES = [
  {
    id: 'LIC-89201',
    key: 'NEXUS-FUL-2025-A892-F104',
    tenantId: 'tenant-1',
    tenantName: 'Harare Primary School & Retail Store',
    plan: 'Full',
    seats: 15,
    maxUsers: 15,
    monthlyPrice: 149,
    issuedDate: '2025-01-15',
    expiryDate: '2027-01-15',
    daysLeft: 534,
    status: 'Active',
    autoRenew: true,
    features: ['pos', 'catalog', 'barcode_scan', 'stock_manager', 'forecasting']
  },
  {
    id: 'LIC-89202',
    key: 'NEXUS-ENT-2025-B492-E882',
    tenantId: 'tenant-2',
    tenantName: 'Bulawayo Central Depot',
    plan: 'Enterprise',
    seats: 50,
    maxUsers: 50,
    monthlyPrice: 399,
    issuedDate: '2025-03-20',
    expiryDate: '2026-08-25',
    daysLeft: 26,
    status: 'Expiring Soon',
    autoRenew: false,
    features: ['pos', 'catalog', 'barcode_scan', 'stock_manager', 'forecasting', 'retail_intelligence', 'multi_store_sync', 'api_webhooks']
  },
  {
    id: 'LIC-89203',
    key: 'NEXUS-STR-2025-C192-S401',
    tenantId: 'tenant-3',
    tenantName: 'Mutare Express Outlet',
    plan: 'Starter',
    seats: 5,
    maxUsers: 5,
    monthlyPrice: 49,
    issuedDate: '2025-06-10',
    expiryDate: '2026-12-10',
    daysLeft: 133,
    status: 'Active',
    autoRenew: true,
    features: ['pos', 'catalog', 'barcode_scan', 'stock_manager']
  },
  {
    id: 'LIC-89204',
    key: 'NEXUS-TRL-2026-T920-X100',
    tenantId: 'tenant-4',
    tenantName: 'Gweru Hub Station',
    plan: 'Trial',
    seats: 3,
    maxUsers: 3,
    monthlyPrice: 0,
    issuedDate: '2026-06-01',
    expiryDate: '2026-08-01',
    daysLeft: 2,
    status: 'Expiring Soon',
    autoRenew: false,
    features: ['pos', 'catalog']
  }
];

export const MOCK_SYSTEM_ALERTS = [
  {
    id: 'ALT-101',
    level: 'warning',
    title: 'License Renewal Warning',
    message: 'Bulawayo Central Depot license (LIC-89202) expires in 26 days.',
    timestamp: '10 mins ago',
    source: 'License Desk'
  },
  {
    id: 'ALT-102',
    level: 'info',
    title: 'Database Auto-Vacuum Complete',
    message: 'Neon PostgreSQL completed automated index optimization across all schemas.',
    timestamp: '1 hour ago',
    source: 'DB Engine'
  },
  {
    id: 'ALT-103',
    level: 'success',
    title: 'Multi-Tenant Backup Synced',
    message: 'Cross-region automated snapshot saved to Cloud Storage (04:00 UTC).',
    timestamp: '5 hours ago',
    source: 'Backup Daemon'
  }
];

export const MOCK_GLOBAL_CONFIG = {
  platformName: 'NexusRetail Super Admin',
  environment: 'Production',
  databaseEngine: 'Neon Serverless PostgreSQL (v16.2)',
  defaultCurrency: '$ (USD)',
  taxRateDefault: 15.0,
  maxUsersAllowedPerTenant: 25,
  maxGlobalUsersLimit: 200,
  enableOfflinePOS: true,
  enableAuditLogging: true,
  autoBackupInterval: 'Daily at 04:00 UTC',
  maintenanceMode: false
};

export const MOCK_SYSTEM_HEALTH = {
  dbLatencyMs: 14,
  dbPoolConnections: 8,
  maxConnections: 100,
  apiUptimePercentage: 99.98,
  activeWebsockets: 42,
  memoryUsageMb: 312,
  maxMemoryMb: 1024,
  cpuLoadPercentage: 12.4
};

// Recharts Bar Data: Product count per school / store (matching green bar chart in mockup)
export const MOCK_STORE_BAR_DATA = [
  { name: 'Harare Primary', students: 4, revenue: 14850 },
  { name: 'Bulawayo Depot', students: 8, revenue: 22400 },
  { name: 'Mutare Express', students: 3, revenue: 9800 },
  { name: 'Gweru Hub', students: 1, revenue: 3400 }
];

// Recharts Donut Data: License Plan Breakdown (matching green donut chart in mockup)
export const MOCK_LICENSE_DONUT_DATA = [
  { name: 'Full', value: 1, color: '#2d7a64' },
  { name: 'Enterprise', value: 1, color: '#10b981' },
  { name: 'Starter', value: 1, color: '#06b6d4' },
  { name: 'Trial', value: 1, color: '#f59e0b' }
];
