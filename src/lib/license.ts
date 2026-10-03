/**
 * ConvertImage — Capabilities & Limits Configuration
 * All core V1 capabilities are available client-side without artificial paywalls.
 */

import { IMAGE_LIMITS } from './constants';

export const BATCH_LIMITS = {
  maxBatchSize: IMAGE_LIMITS.maxBatchFiles,
  maxConcurrency: IMAGE_LIMITS.maxConcurrentWorkers,
} as const;

export interface FeatureAccess {
  batchConversion: boolean;
  exifPreservation: boolean;
  maxBatchFiles: number;
  maxFileSizeMB: number;
}

/**
 * Returns available V1 client-side features and safety limits.
 */
export function getFeatureAccess(): FeatureAccess {
  return {
    batchConversion: true,
    exifPreservation: true,
    maxBatchFiles: IMAGE_LIMITS.maxBatchFiles,
    maxFileSizeMB: IMAGE_LIMITS.maxFileSizeMB,
  };
}
