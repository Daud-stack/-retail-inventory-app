/**
 * Zimbabwe-specific multi-currency VAT/tax calculation engine with dynamic updates & trader profiling.
 */

const TAX_STORAGE_KEY = 'nexus_tax_config';
const TRADER_PROFILE_KEY = 'nexus_trader_profile';

export const TRADER_TIERS = {
  FORMAL: 'formal',     // Registered for VAT, 15.5% VAT, ZIMRA FDMS, 1/3 VAT Withholding B2B
  INFORMAL: 'informal'  // Micro/Small, Presumptive Tax, 5% Wholesaler Surcharge if no ITF263, 10% Market Rental Tax
};

export const IMTT_RATES = {
  ZIG: 0.015, // 1.5% for local ZiG transfers
  USD: 0.020  // 2.0% for USD electronic transfers
};

const defaultTaxConfig = {
  vatRate: 0.155, // 15.5% standard VAT rate
  exchangeRate: 13.5, // ZiG per 1 USD
  defaultCurrency: 'ZIG',
  annualRegistrationThresholdUSD: 25000, // $25,000 annual sales VAT registration threshold
  presumptiveTaxRate: 0.10, // 10% flat presumptive tax on turnover for informal traders
  wholesalerWithholdingRate: 0.05, // 5% withholding tax if no valid ITF263 tax clearance
  marketRentalTaxRate: 0.10, // 10% informal trader rental tax
  zeroRatedKeywords: ['bread', 'milk', 'maize meal', 'cooking oil', 'sugar', 'salt', 'fresh fruit', 'fresh vegetable', 'medical', 'agricultural'],
  exemptKeywords: ['financial', 'educational', 'public transport', 'transport']
};

const defaultTraderProfile = {
  tier: TRADER_TIERS.FORMAL,
  isVatRegistered: true,
  hasValidTaxClearance: true, // ITF263 certificate
  tinNumber: '2001928374',
  vatNumber: '10293847',
  annualSalesUSD: 34500,
  marketStallName: 'Gulf Complex Stall #14'
};

let taxConfig = { ...defaultTaxConfig };
let traderProfile = { ...defaultTraderProfile };

// Load persisted configuration and profile
const loadTaxConfig = () => {
  const storedConfig = localStorage.getItem(TAX_STORAGE_KEY);
  if (storedConfig) {
    try {
      taxConfig = { ...defaultTaxConfig, ...JSON.parse(storedConfig) };
    } catch (e) {
      console.error('Failed to parse tax config', e);
    }
  }

  const storedProfile = localStorage.getItem(TRADER_PROFILE_KEY);
  if (storedProfile) {
    try {
      traderProfile = { ...defaultTraderProfile, ...JSON.parse(storedProfile) };
    } catch (e) {
      console.error('Failed to parse trader profile', e);
    }
  }
};

const saveTaxConfig = () => {
  localStorage.setItem(TAX_STORAGE_KEY, JSON.stringify(taxConfig));
};

const saveTraderProfile = () => {
  localStorage.setItem(TRADER_PROFILE_KEY, JSON.stringify(traderProfile));
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

export const getTraderProfile = () => ({ ...traderProfile });
export const updateTraderProfile = (newProfile) => {
  traderProfile = { ...traderProfile, ...newProfile };
  saveTraderProfile();
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

/**
 * 1. Product Line VAT Category Resolver
 */
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

/**
 * 2. IMTT Calculator for In-App Payments
 */
export const calculateIMTT = (amount, currencyCode = 'ZIG') => {
  const rate = currencyCode === 'USD' ? IMTT_RATES.USD : IMTT_RATES.ZIG;
  const taxAmount = amount * rate;
  return {
    rate,
    rateFormatted: `${(rate * 100).toFixed(1)}%`,
    taxAmount: Number(taxAmount.toFixed(4)),
    totalWithTax: Number((amount + taxAmount).toFixed(4))
  };
};

/**
 * 3. Wholesaler 5% Withholding Tax Alert & Calculator (Informal Trader Purchase)
 */
export const calculateWholesalerWithholding = (invoiceAmount, hasTaxClearance = traderProfile.hasValidTaxClearance) => {
  if (hasTaxClearance) {
    return { applies: false, rate: 0, surchargeAmount: 0, totalPayable: invoiceAmount };
  }
  const surcharge = invoiceAmount * taxConfig.wholesalerWithholdingRate;
  return {
    applies: true,
    rate: taxConfig.wholesalerWithholdingRate,
    rateFormatted: '5.0%',
    surchargeAmount: Number(surcharge.toFixed(4)),
    totalPayable: Number((invoiceAmount + surcharge).toFixed(4)),
    warningMessage: 'Mandatory 5% ZIMRA Withholding Tax Surcharge applied due to missing valid ITF263 Tax Clearance Certificate.'
  };
};

/**
 * 4. Market Stall Rental Tax (10% Informal Trader Rental Withholding)
 */
export const calculateMarketStallRentalTax = (grossRentAmount) => {
  const withheldTax = grossRentAmount * taxConfig.marketRentalTaxRate;
  const netLandlordPayout = grossRentAmount - withheldTax;
  return {
    grossRent: grossRentAmount,
    taxRate: taxConfig.marketRentalTaxRate,
    withheldTaxAmount: Number(withheldTax.toFixed(4)),
    netLandlordPayout: Number(netLandlordPayout.toFixed(4))
  };
};

/**
 * 5. VAT Threshold Warning Monitor ($25,000 USD Annual Threshold)
 */
export const checkVATRegistrationRequirement = (annualSalesUSD = traderProfile.annualSalesUSD) => {
  const threshold = taxConfig.annualRegistrationThresholdUSD;
  const isOverThreshold = annualSalesUSD >= threshold;
  return {
    annualSalesUSD,
    thresholdUSD: threshold,
    isOverThreshold,
    requiresVatRegistration: isOverThreshold && !traderProfile.isVatRegistered,
    warningMessage: isOverThreshold && !traderProfile.isVatRegistered
      ? `CRITICAL COMPLIANCE NOTICE: Your annual sales ($${annualSalesUSD.toLocaleString()} USD) exceed the ZIMRA threshold ($${threshold.toLocaleString()} USD). You are legally required to register for VAT and integrate with ZIMRA FDMS.`
      : null
  };
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
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency.symbol}${parts.join('.')}`;
};

export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRate = taxConfig.exchangeRate) => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'ZIG') {
    return amount * exchangeRate;
  } else if (fromCurrency === 'ZIG' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }
  
  return amount;
};

/**
 * Multi-Currency Split Checkout Tax Generator
 */
export const generateTaxBreakdown = (cartItems, currency = DEFAULT_CURRENCY, isVATInclusive = false, splitPayment = null) => {
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

  // Calculate multi-currency split VAT breakdown if customer paid in mixed currencies (e.g. 60% ZiG, 40% USD)
  let multiCurrencySplit = null;
  if (splitPayment && splitPayment.zigAmount > 0 && splitPayment.usdAmount > 0) {
    const totalPaidInUSD = splitPayment.usdAmount + (splitPayment.zigAmount / taxConfig.exchangeRate);
    const zigRatio = (splitPayment.zigAmount / taxConfig.exchangeRate) / totalPaidInUSD;
    const usdRatio = splitPayment.usdAmount / totalPaidInUSD;

    multiCurrencySplit = {
      zigPortion: {
        paidZiG: splitPayment.zigAmount,
        subtotalZiG: Number((subtotal * taxConfig.exchangeRate * zigRatio).toFixed(2)),
        vatZiG: Number((totalVAT * taxConfig.exchangeRate * zigRatio).toFixed(2)),
        grandTotalZiG: Number((grandTotal * taxConfig.exchangeRate * zigRatio).toFixed(2))
      },
      usdPortion: {
        paidUSD: splitPayment.usdAmount,
        subtotalUSD: Number((subtotal * usdRatio).toFixed(2)),
        vatUSD: Number((totalVAT * usdRatio).toFixed(2)),
        grandTotalUSD: Number((grandTotal * usdRatio).toFixed(2))
      }
    };
  }

  // Informal trader presumptive tax calculation fallback
  const isInformal = traderProfile.tier === TRADER_TIERS.INFORMAL;
  const presumptiveTaxAmount = isInformal ? (grandTotal * taxConfig.presumptiveTaxRate) : 0;

  return {
    items: itemsBreakdown,
    subtotal: Number(subtotal.toFixed(2)),
    totalVAT: isInformal ? 0 : Number(totalVAT.toFixed(2)), // Informal traders don't charge VAT
    totalZeroRated: Number(totalZeroRated.toFixed(2)),
    totalExempt: Number(totalExempt.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    currency,
    vatRate: isInformal ? 0 : getVATRate(),
    isInformalTrader: isInformal,
    presumptiveTaxAmount: Number(presumptiveTaxAmount.toFixed(2)),
    section50aWithholding: isInformal ? 0 : calculateSection50AWithholding(totalVAT),
    multiCurrencySplit
  };
};

export const generateZReport = (transactions, date) => {
  const summary = {
    date,
    transactionCount: transactions.length,
    salesByCurrency: { ZIG: 0, USD: 0 },
    vatByCurrency: { ZIG: 0, USD: 0 },
    presumptiveTaxByCurrency: { ZIG: 0, USD: 0 },
    imttTaxCollected: { ZIG: 0, USD: 0 },
    section50aWithheld: { ZIG: 0, USD: 0 },
    paymentMethods: {}
  };

  transactions.forEach(tx => {
    const currency = tx.currency || DEFAULT_CURRENCY;
    
    if (summary.salesByCurrency[currency] !== undefined) {
      summary.salesByCurrency[currency] += tx.total || 0;
      summary.vatByCurrency[currency] += tx.vatAmount || 0;
      if (tx.presumptiveTaxAmount) summary.presumptiveTaxByCurrency[currency] += tx.presumptiveTaxAmount;
      if (tx.imttAmount) summary.imttTaxCollected[currency] += tx.imttAmount;
      if (tx.section50aWithholding) summary.section50aWithheld[currency] += tx.section50aWithholding;
    }
    
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

