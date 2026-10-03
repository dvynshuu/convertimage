'use client';

import { BATCH_LIMITS, getFeatureAccess } from '@/lib/license';

export function useLicense() {
  const access = getFeatureAccess();
  return {
    isPro: true,
    maxBatchSize: BATCH_LIMITS.maxBatchSize,
    maxConcurrency: BATCH_LIMITS.maxConcurrency,
    features: access,
  };
}
