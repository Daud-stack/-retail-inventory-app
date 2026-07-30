/**
 * Zimbabwe-specific multi-currency VAT/tax calculation engine with dynamic updates & persistence.
 */

const TAX_STORAGE_KEY = 'nexus_tax_config';

const defaultTaxConfig = {
  vatRate: 0.155, // 15.5% standard VAT rate
  exchangeRate: 13.5, // ZiG per 1 USD
  defaultCurrency: 'ZIG',
  zeroRatedKeywords: ['bread', 'milk', 'maize meal', 'cooking oil', 'sugar', 'salt', 'fresh fruit', 'fresh vegetable', 'medical', 'agricultural'],
  exemptKeywords: ['financial', 'educational', 'public transport', 'transport']
};

let taxConfig = { ...defaultTaxConfig };

// Load persisted configuration
const loadTaxConfig = () => {
  const stored = localStorage.getItem(TAX_STORAGE_KEY);
  if (stored) {
    try {
      taxConfig = { ...defaultTaxConfig, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse tax config', e);
    }
  }
};

const saveTaxConfig = () => {
  localStorage.setItem(TAX_STORAGE_KEY, JSON.stringify(taxConfig));
};

loadTaxConfig();

export const getVATRate = () => taxConfig.vatRate;
export const setVATRate = (newRate) => {
  taxConfig.vatRate = parseFloat(newRate);
  saveTaxConfig();
};

export const getExchangeRate = () => taxConfig.exchangeRate;
export const setExchangeRate = (rate) => {
  taxConfig.exchangeRate = parseFloat(rate);
  saveTaxConfig();
};

export const getTaxConfig = () => ({ ...taxConfig });
export const updateTaxConfig = (newConfig) => {
  taxConfig = { ...taxConfig, ...newConfig };
  saveTaxConfig();
};

export const VAT_RATE = taxConfig.vatRate;
export const DEFAULT_CURRENCY = 'ZIG';

export const CURRENCIES = {
  ZIG: { code: 'ZIG', symbol: 'ZiG', name: 'Zimbabwe Gold', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 }
};

export const TAX_CATEGORIES = {
  STANDARD: 'standard',
  ZERO_RATED: 'zero_rated',
  EXEMPT: 'exempt'
};

export const getProductTaxCategory = (productName = '', category = '') => {
  const normalizedStr = `${productName} ${category}`.toLowerCase();
  
  if (taxConfig.exemptKeywords.some(kw => normalizedStr.includes(kw))) {
    return TAX_CATEGORIES.EXEMPT;
  }
  
  if (taxConfig.zeroRatedKeywords.some(kw => normalizedStr.includes(kw))) {
    return TAX_CATEGORIES.ZERO_RATED;
  }
  
  return TAX_CATEGORIES.STANDARD;
};

export const calculateVAT = (amount, taxCategory, isInclusive = false) => {
  if (taxCategory === TAX_CATEGORIES.ZERO_RATED || taxCategory === TAX_CATEGORIES.EXEMPT) {
    return {
      subtotal: amount,
      vatAmount: 0,
      total: amount,
      taxCategory,
      vatRate: 0
    };
  }

  if (isInclusive) {
    return calculateVATInclusive(amount, taxCategory);
  } else {
    return calculateVATExclusive(amount, taxCategory);
  }
};

export const calculateVATInclusive = (totalAmount, taxCategory) => {
  if (taxCategory !== TAX_CATEGORIES.STANDARD) {
    return calculateVAT(totalAmount, taxCategory, false);
  }
  const currentRate = getVATRate();
  const subtotal = totalAmount / (1 + currentRate);
  const vatAmount = totalAmount - subtotal;
  return {
    subtotal: Number(subtotal.toFixed(4)),
    vatAmount: Number(vatAmount.toFixed(4)),
    total: totalAmount,
    taxCategory,
    vatRate: currentRate
  };
};

export const calculateVATExclusive = (netAmount, taxCategory) => {
  if (taxCategory !== TAX_CATEGORIES.STANDARD) {
    return calculateVAT(netAmount, taxCategory, false);
  }
  const currentRate = getVATRate();
  const vatAmount = netAmount * currentRate;
  const total = netAmount + vatAmount;
  return {
    subtotal: netAmount,
    vatAmount: Number(vatAmount.toFixed(4)),
    total: Number(total.toFixed(4)),
    taxCategory,
    vatRate: currentRate
  };
};

export const calculateSection50AWithholding = (vatAmount) => {
  return Number((vatAmount / 3).toFixed(4));
};

export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const value = Number(amount).toFixed(currency.decimals);
  // Add thousands separators
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency.symbol}${parts.join('.')}`;
};

export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRate = currentExchangeRate) => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'ZIG') {
    return amount * exchangeRate;
  } else if (fromCurrency === 'ZIG' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }
  
  return amount; // Fallback if currencies are unhandled
};

export const generateTaxBreakdown = (cartItems, currency = DEFAULT_CURRENCY, isVATInclusive = false) => {
  let subtotal = 0;
  let totalVAT = 0;
  let totalZeroRated = 0;
  let totalExempt = 0;
  let grandTotal = 0;

  const itemsBreakdown = cartItems.map(item => {
    const taxCategory = item.taxCategory || getProductTaxCategory(item.name, item.category);
    const lineTotal = item.qty * item.unitPrice;
    
    const { subtotal: itemSubtotal, vatAmount, total } = calculateVAT(lineTotal, taxCategory, isVATInclusive);
    
    if (taxCategory === TAX_CATEGORIES.ZERO_RATED) {
      totalZeroRated += total;
    } else if (taxCategory === TAX_CATEGORIES.EXEMPT) {
      totalExempt += total;
    }

    subtotal += itemSubtotal;
    totalVAT += vatAmount;
    grandTotal += total;

    return {
      name: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      lineTotal,
      taxCategory,
      vatAmount: Number(vatAmount.toFixed(4))
    };
  });

  return {
    items: itemsBreakdown,
    subtotal: Number(subtotal.toFixed(2)),
    totalVAT: Number(totalVAT.toFixed(2)),
    totalZeroRated: Number(totalZeroRated.toFixed(2)),
    totalExempt: Number(totalExempt.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    currency,
    vatRate: VAT_RATE,
    section50aWithholding: calculateSection50AWithholding(totalVAT)
  };
};

export const generateZReport = (transactions, date) => {
  const summary = {
    date,
    transactionCount: transactions.length,
    salesByCurrency: { ZIG: 0, USD: 0 },
    vatByCurrency: { ZIG: 0, USD: 0 },
    paymentMethods: {}
  };

  transactions.forEach(tx => {
    const currency = tx.currency || DEFAULT_CURRENCY;
    
    // Accumulate sales and VAT
    if (summary.salesByCurrency[currency] !== undefined) {
      summary.salesByCurrency[currency] += tx.total || 0;
      summary.vatByCurrency[currency] += tx.vatAmount || 0;
    }
    
    // Accumulate payment methods
    const method = tx.paymentMethod || 'UNKNOWN';
    if (!summary.paymentMethods[method]) {
      summary.paymentMethods[method] = { ZIG: 0, USD: 0 };
    }
    if (summary.paymentMethods[method][currency] !== undefined) {
      summary.paymentMethods[method][currency] += tx.total || 0;
    }
  });

  return summary;
};
