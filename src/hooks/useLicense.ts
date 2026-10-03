'use client';

import { BATCH_LIMITS } from '@/lib/license';

export function useLicense() {
  return {
    isPro: true,
    licenseKey: 'ALL-ACCESS',
    maxBatchSize: BATCH_LIMITS.maxBatchSize,
    maxConcurrency: BATCH_LIMITS.maxConcurrency,
    activate: () => ({ success: true, message: 'All features are already unlocked!' }),
    deactivate: () => {},
    isUpgradeModalOpen: false,
    openUpgradeModal: () => {},
    closeUpgradeModal: () => {},
  };
}
