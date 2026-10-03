/**
 * Canonical Conversion Pipeline Controller
 *
 * Provides a unified, single entrypoint for both single-image and batch workflows:
 * UI -> Conversion Controller -> Shared Validation -> Job Queue -> Worker Pool -> Codec Adapter -> Result Normalization
 */

import type { ConversionOptions, ConversionResult } from '../types';
import { validateFile } from '../formats';
import { globalWorkerPool } from './workerPool';
import { createConversionError } from '../errors';

/**
 * Execute a conversion job through the canonical pipeline.
 * Validates with the single source of truth, then routes to the worker pool.
 */
export async function executeConversionJob(
  jobId: string,
  file: File,
  options: ConversionOptions,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
): Promise<ConversionResult> {
  // 1. Shared validation check
  const validation = await validateFile(file);
  if (!validation.valid) {
    throw validation.error || createConversionError('INVALID_FILE');
  }

  // Ensure inputFormat is set from validated format
  const resolvedOptions: ConversionOptions = {
    ...options,
    inputFormat: validation.format || options.inputFormat,
  };

  // 2. Delegate to Reusable Worker Pool
  return globalWorkerPool.enqueue(jobId, file, resolvedOptions, onProgress, abortSignal);
}
