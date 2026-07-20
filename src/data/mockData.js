export const INITIAL_PRODUCTS = [
  // Clothing Category
  {
    id: 'prod-1',
    name: 'Vintage Denim Jacket',
    sku: 'CLN-849201',
    category: 'Clothing',
    price: 89.99,
    cost: 45.00,
    stock: 18,
    minStock: 5,
    supplier: 'UrbanWear Apparel',
    unit: 'pcs',
    size: 'L',
    location: 'Aisle C - Rack 04',
    lastRestocked: '2026-07-10',
    color: '#3b82f6'
  },
  {
    id: 'prod-2',
    name: 'Organic Cotton Crew Tee',
    sku: 'CLN-392019',
    category: 'Clothing',
    price: 24.50,
    cost: 9.80,
    stock: 4, // Low stock
    minStock: 10,
    supplier: 'EcoThread Co.',
    unit: 'pcs',
    size: 'M',
    location: 'Aisle C - Rack 01',
    lastRestocked: '2026-06-25',
    color: '#10b981'
  },
  {
    id: 'prod-3',
    name: 'Slim Fit Chino Pants',
    sku: 'CLN-583012',
    category: 'Clothing',
    price: 54.00,
    cost: 26.00,
    stock: 32,
    minStock: 8,
    supplier: 'UrbanWear Apparel',
    unit: 'pcs',
    size: '32/34',
    location: 'Aisle C - Rack 08',
    lastRestocked: '2026-07-15',
    color: '#6366f1'
  },
  {
    id: 'prod-4',
    name: 'Thermal Fleece Hoodie',
    sku: 'CLN-104928',
    category: 'Clothing',
    price: 68.00,
    cost: 31.50,
    stock: 2, // Low stock
    minStock: 6,
    supplier: 'NorthPeak Gear',
    unit: 'pcs',
    size: 'XL',
    location: 'Aisle C - Rack 12',
    lastRestocked: '2026-07-02',
    color: '#f59e0b'
  },

  // Groceries Category
  {
    id: 'prod-5',
    name: 'Artisanal Cold Brew Coffee (1L)',
    sku: 'GRO-194820',
    category: 'Groceries',
    price: 9.99,
    cost: 4.20,
    stock: 45,
    minStock: 15,
    supplier: 'Roast & Brew Beans',
    unit: 'bottle',
    location: 'Fridge 02 - Shelf A',
    lastRestocked: '2026-07-18',
    color: '#8b5cf6'
  },
  {
    id: 'prod-6',
    name: 'Extra Virgin Olive Oil (750ml)',
    sku: 'GRO-884920',
    category: 'Groceries',
    price: 18.50,
    cost: 11.00,
    stock: 3, // Low stock
    minStock: 8,
    supplier: 'Mediterranean Imports',
    unit: 'bottle',
    location: 'Aisle G - Shelf 03',
    lastRestocked: '2026-07-01',
    color: '#ec4899'
  },
  {
    id: 'prod-7',
    name: 'Organic Almond Milk (1L)',
    sku: 'GRO-503912',
    category: 'Groceries',
    price: 4.75,
    cost: 2.10,
    stock: 60,
    minStock: 20,
    supplier: 'NutriPure Foods',
    unit: 'carton',
    location: 'Fridge 01 - Shelf B',
    lastRestocked: '2026-07-19',
    color: '#14b8a6'
  },
  {
    id: 'prod-8',
    name: 'Sourdough Craft Loaf',
    sku: 'GRO-772910',
    category: 'Groceries',
    price: 6.20,
    cost: 2.50,
    stock: 0, // Out of stock
    minStock: 10,
    supplier: 'Golden Crust Bakery',
    unit: 'loaf',
    location: 'Aisle G - Bakery Table',
    lastRestocked: '2026-07-17',
    color: '#ef4444'
  },
  {
    id: 'prod-9',
    name: 'Raw Wildflower Honey (500g)',
    sku: 'GRO-930219',
    category: 'Groceries',
    price: 12.99,
    cost: 6.50,
    stock: 24,
    minStock: 5,
    supplier: 'Valley Apiaries',
    unit: 'jar',
    location: 'Aisle G - Shelf 05',
    lastRestocked: '2026-07-08',
    color: '#f97316'
  },

  // Miscellaneous Category
  {
    id: 'prod-10',
    name: 'Wireless Ergonomic Mouse',
    sku: 'MSC-774910',
    category: 'Miscellaneous',
    price: 39.99,
    cost: 18.00,
    stock: 28,
    minStock: 8,
    supplier: 'TechGrid Electronics',
    unit: 'box',
    location: 'Aisle M - Bin 14',
    lastRestocked: '2026-07-14',
    color: '#06b6d4'
  },
  {
    id: 'prod-11',
    name: 'Stainless Steel Water Bottle (750ml)',
    sku: 'MSC-449102',
    category: 'Miscellaneous',
    price: 22.00,
    cost: 8.50,
    stock: 5, // Low stock
    minStock: 12,
    supplier: 'HydroPeak Essentials',
    unit: 'pcs',
    location: 'Aisle M - Shelf 02',
    lastRestocked: '2026-07-05',
    color: '#a855f7'
  },
  {
    id: 'prod-12',
    name: 'Aroma Diffuser & Essential Oils',
    sku: 'MSC-662019',
    category: 'Miscellaneous',
    price: 49.50,
    cost: 21.00,
    stock: 14,
    minStock: 5,
    supplier: 'ZenLiving Co.',
    unit: 'set',
    location: 'Aisle M - Shelf 09',
    lastRestocked: '2026-07-11',
    color: '#34d399'
  },
  {
    id: 'prod-13',
    name: 'Braided USB-C Fast Charge Cable (2m)',
    sku: 'MSC-302910',
    category: 'Miscellaneous',
    price: 14.99,
    cost: 4.20,
    stock: 85,
    minStock: 25,
    supplier: 'TechGrid Electronics',
    unit: 'pcs',
    location: 'Aisle M - Counter Display',
    lastRestocked: '2026-07-19',
    color: '#3b82f6'
  }
];

export const MOCK_RECENT_TRANSACTIONS = [
  { id: 'INV-1094', customer: 'Walk-in Customer', itemsCount: 3, total: 124.48, date: '14:22 Today', status: 'Completed' },
  { id: 'INV-1093', customer: 'Sarah Jenkins', itemsCount: 1, total: 89.99, date: '13:05 Today', status: 'Completed' },
  { id: 'INV-1092', customer: 'Corporate Account #42', itemsCount: 8, total: 342.10, date: '11:40 Today', status: 'Completed' },
  { id: 'INV-1091', customer: 'Walk-in Customer', itemsCount: 2, total: 28.49, date: '10:15 Today', status: 'Completed' },
];
