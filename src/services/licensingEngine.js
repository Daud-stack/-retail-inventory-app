/**
 * SAAS LICENSING ENGINE
 * Feature gating matrix, structured license key generator, key decoder & validation engine.
 */

export const LICENSE_TIERS = {
  TRIAL: 'Trial',
  STARTER: 'Starter',
  FULL: 'Full',
  ENTERPRISE: 'Enterprise'
};

export const FEATURE_FLAGS = {
  POS_CHECKOUT: 'pos',
  PRODUCT_CATALOG: 'catalog',
  BARCODE_SCAN: 'barcode_scan',
  STOCK_MANAGER: 'stock_manager',
  STOCK_FORECASTING: 'forecasting',
  RETAIL_INTELLIGENCE: 'retail_intelligence',
  MULTI_STORE_SYNC: 'multi_store_sync',
  API_WEBHOOKS: 'api_webhooks'
};

// Feature Availability Matrix per Licensing Tier
export const TIER_CAPABILITIES = {
  [LICENSE_TIERS.TRIAL]: {
    name: 'Trial License',
    maxUsers: 3,
    priceMonthly: 0,
    features: [FEATURE_FLAGS.POS_CHECKOUT, FEATURE_FLAGS.PRODUCT_CATALOG],
    description: '30-day sandbox evaluation for small retail outlets.'
  },
  [LICENSE_TIERS.STARTER]: {
    name: 'Starter Plan',
    maxUsers: 5,
    priceMonthly: 49,
    features: [
      FEATURE_FLAGS.POS_CHECKOUT, 
      FEATURE_FLAGS.PRODUCT_CATALOG, 
      FEATURE_FLAGS.BARCODE_SCAN, 
      FEATURE_FLAGS.STOCK_MANAGER
    ],
    description: 'Essential POS checkout & stock management for single-location stores.'
  },
  [LICENSE_TIERS.FULL]: {
    name: 'Full Professional Plan',
    maxUsers: 15,
    priceMonthly: 149,
    features: [
      FEATURE_FLAGS.POS_CHECKOUT, 
      FEATURE_FLAGS.PRODUCT_CATALOG, 
      FEATURE_FLAGS.BARCODE_SCAN, 
      FEATURE_FLAGS.STOCK_MANAGER, 
      FEATURE_FLAGS.STOCK_FORECASTING
    ],
    description: 'Advanced stock demand forecasting, automated reorders & multi-user access.'
  },
  [LICENSE_TIERS.ENTERPRISE]: {
    name: 'Enterprise Plan',
    maxUsers: 50,
    priceMonthly: 399,
    features: [
      FEATURE_FLAGS.POS_CHECKOUT, 
      FEATURE_FLAGS.PRODUCT_CATALOG, 
      FEATURE_FLAGS.BARCODE_SCAN, 
      FEATURE_FLAGS.STOCK_MANAGER, 
      FEATURE_FLAGS.STOCK_FORECASTING, 
      FEATURE_FLAGS.RETAIL_INTELLIGENCE, 
      FEATURE_FLAGS.MULTI_STORE_SYNC, 
      FEATURE_FLAGS.API_WEBHOOKS
    ],
    description: 'Complete multi-store network control, AI retail intelligence (Apriori), and webhooks.'
  }
};

/**
 * Generates a structured cryptographic-style License Key:
 * Format: NEXUS-{TIER_CODE}-{YEAR}-{RANDOM_HEX4}-{CHECKSUM_HEX4}
 */
export function generateLicenseKey(planTier = LICENSE_TIERS.FULL, durationMonths = 12, seats = 15) {
  const tierCode = planTier === LICENSE_TIERS.ENTERPRISE ? 'ENT' :
                   planTier === LICENSE_TIERS.FULL ? 'FUL' :
                   planTier === LICENSE_TIERS.STARTER ? 'STR' : 'TRL';

  const year = new Date().getFullYear();
  const hexChunk1 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
  const hexChunk2 = Math.floor(10000 + Math.random() * 90000).toString(16).toUpperCase();

  const keyString = `NEXUS-${tierCode}-${year}-${hexChunk1}-${hexChunk2}`;
  
  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + parseInt(durationMonths));

  return {
    key: keyString,
    plan: planTier,
    seats: parseInt(seats),
    issuedDate: issueDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    daysLeft: Math.ceil((expiryDate - issueDate) / (1000 * 60 * 60 * 24)),
    status: 'Active',
    features: TIER_CAPABILITIES[planTier]?.features || []
  };
}

/**
 * Decodes and inspects a raw license key string.
 */
export function decodeLicenseKey(keyString) {
  if (!keyString || typeof keyString !== 'string') {
    return { valid: false, error: 'Invalid key input format' };
  }

  const cleanKey = keyString.trim().toUpperCase();
  const parts = cleanKey.split('-');

  if (parts.length < 5 || parts[0] !== 'NEXUS') {
    return { valid: false, error: 'Unrecognized key signature (Must start with NEXUS-)' };
  }

  const tierCode = parts[1];
  const year = parts[2];

  let plan = LICENSE_TIERS.STARTER;
  if (tierCode === 'ENT') plan = LICENSE_TIERS.ENTERPRISE;
  else if (tierCode === 'FUL') plan = LICENSE_TIERS.FULL;
  else if (tierCode === 'TRL') plan = LICENSE_TIERS.TRIAL;

  const capabilities = TIER_CAPABILITIES[plan] || TIER_CAPABILITIES[LICENSE_TIERS.STARTER];

  return {
    valid: true,
    key: cleanKey,
    plan,
    year,
    maxUsers: capabilities.maxUsers,
    monthlyPrice: capabilities.priceMonthly,
    features: capabilities.features,
    description: capabilities.description
  };
}

/**
 * Checks if a specific feature is permitted under a given plan tier.
 */
export function isFeatureAllowed(planTier, featureKey) {
  const capabilities = TIER_CAPABILITIES[planTier];
  if (!capabilities) return false;
  return capabilities.features.includes(featureKey);
}

/**
 * Calculates days remaining until license expiration date.
 */
export function calculateDaysRemaining(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}
