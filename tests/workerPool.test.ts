import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WorkerPool } from '../src/lib/conversion/workerPool';
import { IMAGE_LIMITS } from '../src/lib/constants';

describe('WorkerPool Orchestration & Lifecycle', () => {
  it('initializes with bounded concurrency', () => {
    const pool = new WorkerPool(10); // requests 10, but should be bounded by maxConcurrentWorkers (4)
    assert.ok(pool.getConcurrency() <= IMAGE_LIMITS.maxConcurrentWorkers);
    assert.equal(pool.getQueueLength(), 0);
    assert.equal(pool.getActiveCount(), 0);
    pool.destroy();
  });

  it('rejects with CANCELLED when an enqueued task is cancelled before execution', async () => {
    const pool = new WorkerPool(1);
    const mockFile = new File(['mock pixel content'], 'test.png', { type: 'image/png' });

    // Enqueue a task
    const promise = pool.enqueue('task-cancel-1', mockFile, {
      inputFormat: 'png',
      outputFormat: 'webp',
      quality: 0.8,
    });

    // Cancel immediately while queued
    pool.cancel('task-cancel-1');

    await assert.rejects(
      async () => {
        await promise;
      },
      (err: unknown) => {
        return (
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code: string }).code === 'CANCELLED'
        );
      },
    );

    pool.destroy();
  });

  it('rejects all queued tasks when cancelAll is called', async () => {
    const pool = new WorkerPool(1);
    const mockFile1 = new File(['mock pixel content 1'], 'test1.png', { type: 'image/png' });
    const mockFile2 = new File(['mock pixel content 2'], 'test2.png', { type: 'image/png' });

    const p1 = pool.enqueue('task-all-1', mockFile1, {
      inputFormat: 'png',
      outputFormat: 'webp',
      quality: 0.8,
    });
    const p2 = pool.enqueue('task-all-2', mockFile2, {
      inputFormat: 'png',
      outputFormat: 'webp',
      quality: 0.8,
    });

    pool.cancelAll();

    await assert.rejects(p1);
    await assert.rejects(p2);

    assert.equal(pool.getQueueLength(), 0);
    assert.equal(pool.getActiveCount(), 0);
    pool.destroy();
  });

  it('allows dynamic concurrency adjustment within safe bounds', () => {
    const pool = new WorkerPool(2);
    assert.equal(pool.getConcurrency(), 2);

    pool.setConcurrency(3);
    assert.equal(pool.getConcurrency(), 3);

    pool.setConcurrency(99);
    assert.equal(pool.getConcurrency(), IMAGE_LIMITS.maxConcurrentWorkers);

    pool.destroy();
  });
});
