import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BATCH_LIMITS,
  getFeatureAccess,
} from '../src/lib/license';
import { IMAGE_LIMITS } from '../src/lib/constants';

describe('V1 Capabilities Configuration', () => {
  it('provides honest safe batch limits', () => {
    assert.equal(BATCH_LIMITS.maxBatchSize, IMAGE_LIMITS.maxBatchFiles);
    assert.equal(BATCH_LIMITS.maxConcurrency, IMAGE_LIMITS.maxConcurrentWorkers);
  });

  it('reports all V1 client-side features are enabled', () => {
    const features = getFeatureAccess();
    assert.equal(features.batchConversion, true);
    assert.equal(features.exifPreservation, true);
    assert.equal(features.maxBatchFiles, 50);
    assert.equal(features.maxFileSizeMB, 25);
  });
});
