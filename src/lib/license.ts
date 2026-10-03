/**
 * ConvertImage — All-Access Configuration
 * All features (500+ batch conversions, 6-worker concurrency, EXIF control)
 * are unlocked and available to all users for free.
 */

export const BATCH_LIMITS = {
  maxBatchSize: 500,
  maxConcurrency: 6,
  // Backwards compatibility aliases
  freeBatchSize: 500,
  proBatchSize: 500,
  freeConcurrency: 6,
  proConcurrency: 6,
} as const;

export interface LicenseValidationResult {
  valid: boolean;
  tier: 'pro';
  licenseKey: string | null;
}

/**
 * All users have full pro access by default
 */
export function getStoredLicense(): LicenseValidationResult {
  return { valid: true, tier: 'pro', licenseKey: 'CONVERTIMAGE-UNLOCKED' };
}

export function validateLicenseKey(): boolean {
  return true;
}
