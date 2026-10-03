import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BATCH_LIMITS,
  getStoredLicense,
  validateLicenseKey,
} from '../src/lib/license';

describe('All-Access Configuration', () => {
  it('provides unlocked batch limits for all users', () => {
    assert.equal(BATCH_LIMITS.maxBatchSize, 500);
    assert.equal(BATCH_LIMITS.maxConcurrency, 6);
  });

  it('reports pro tier access by default without license requirements', () => {
    const license = getStoredLicense();
    assert.equal(license.valid, true);
    assert.equal(license.tier, 'pro');
  });

  it('validates all keys as true in all-access mode', () => {
    assert.equal(validateLicenseKey(), true);
  });
});
