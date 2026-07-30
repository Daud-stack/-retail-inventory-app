/**
 * Data Import/Export Service
 * Handles CSV product import/export and JSON store backups.
 */

export const exportProductsCSV = (products) => {
  if (!products || products.length === 0) {
    return '';
  }

  const headers = ['id', 'sku', 'name', 'category', 'price_usd', 'price_zig', 'stock_quantity', 'min_stock_level'];
  
  const csvRows = [
    headers.join(','),
    ...products.map(p => {
      return headers.map(header => {
        let value = p[header] === null || p[header] === undefined ? '' : String(p[header]);
        // Escape quotes and wrap in quotes if contains comma
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    })
  ];

  return csvRows.join('\n');
};

export const parseProductsCSV = (csvString) => {
  if (!csvString) return [];
  
  const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return []; // No data rows
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Simple regex for comma split handling quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const values = matches ? matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"')) : line.split(',');
    
    const product = {};
    headers.forEach((header, index) => {
      product[header] = values[index] !== undefined ? values[index] : null;
    });
    
    // Validate required fields
    if (product.sku && product.name) {
       products.push(product);
    }
  }
  
  return products;
};

export const exportFullBackupJSON = (storeData) => {
  const backup = {
    metadata: {
      version: '1.0',
      exportedAt: new Date().toISOString(),
    },
    data: {
      products: storeData.products || [],
      transactions: storeData.transactions || [],
      stockMovements: storeData.stockMovements || [],
      users: storeData.users || [],
      customers: storeData.customers || []
    }
  };
  
  return JSON.stringify(backup, null, 2);
};

export const importFullBackupJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed.metadata || !parsed.data) {
      throw new Error("Invalid backup file format");
    }
    
    const { products, transactions, stockMovements, users, customers } = parsed.data;
    
    return {
      success: true,
      data: {
        products: Array.isArray(products) ? products : [],
        transactions: Array.isArray(transactions) ? transactions : [],
        stockMovements: Array.isArray(stockMovements) ? stockMovements : [],
        users: Array.isArray(users) ? users : [],
        customers: Array.isArray(customers) ? customers : [],
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to parse JSON backup file.'
    };
  }
};
