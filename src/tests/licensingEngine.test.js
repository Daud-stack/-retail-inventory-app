import { describe, it, expect } from 'vitest';
import { 
  LICENSE_TIERS, 
  FEATURE_FLAGS, 
  generateLicenseKey, 
  decodeLicenseKey, 
  isFeatureAllowed, 
  calculateDaysRemaining 
} from '../services/licensingEngine';

describe('SaaS Licensing Engine Tests', () => {

  it('should generate a valid structured license key for Enterprise tier', () => {
    const lic = generateLicenseKey(LICENSE_TIERS.ENTERPRISE, 12, 50);
    expect(lic.key).toMatch(/^NEXUS-ENT-\d{4}-[0-9A-F]+-[0-9A-F]+/);
    expect(lic.plan).toBe(LICENSE_TIERS.ENTERPRISE);
    expect(lic.seats).toBe(50);
    expect(lic.features).toContain(FEATURE_FLAGS.RETAIL_INTELLIGENCE);
    expect(lic.features).toContain(FEATURE_FLAGS.MULTI_STORE_SYNC);
  });

  it('should decode a valid NEXUS key string correctly', () => {
    const decoded = decodeLicenseKey('NEXUS-ENT-2026-A1B2-C3D4');
    expect(decoded.valid).toBe(true);
    expect(decoded.plan).toBe(LICENSE_TIERS.ENTERPRISE);
    expect(decoded.maxUsers).toBe(50);
  });

  it('should reject malformed or invalid license keys', () => {
    const decoded = decodeLicenseKey('INVALID-KEY-STRING');
    expect(decoded.valid).toBe(false);
    expect(decoded.error).toBeDefined();
  });

  it('should correctly evaluate feature permissions per plan tier', () => {
    expect(isFeatureAllowed(LICENSE_TIERS.ENTERPRISE, FEATURE_FLAGS.RETAIL_INTELLIGENCE)).toBe(true);
    expect(isFeatureAllowed(LICENSE_TIERS.STARTER, FEATURE_FLAGS.RETAIL_INTELLIGENCE)).toBe(false);
    expect(isFeatureAllowed(LICENSE_TIERS.FULL, FEATURE_FLAGS.STOCK_FORECASTING)).toBe(true);
  });

  it('should calculate days remaining until expiration correctly', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const days = calculateDaysRemaining(futureDate.toISOString().split('T')[0]);
    expect(days).toBeGreaterThanOrEqual(9);
  });

});
