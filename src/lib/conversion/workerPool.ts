/**
 * Reusable Web Worker Pool & Orchestration Engine
 *
 * Implements:
 * - Persistent reusable Web Worker pool (no recreate-per-image churn)
 * - Safe concurrency bounded by device capability & safety cap
 * - Watchdog timeout protection (30s)
 * - Clean cancellation with reliable Promise rejection and worker replacement
 * - Single-authority counter accounting (no double decrements)
 * - Automatic main-thread fallback for HEIC and unsupported worker environments
 * - EXIF preservation & GPS sanitization with fresh object URL generation
 */

import type {
  ConversionOptions,
  ConversionResult,
  ConversionError,
  WorkerRequest,
  WorkerResponse,
} from '../types';
import { generateOutputFilename } from '../formats';
import { IMAGE_LIMITS } from '../constants';
import { createConversionError } from '../errors';
import { createTrackedUrl, replaceTrackedUrl } from '../objectUrls';
import { applyExifPolicy } from './exif';
import { convertImageMainThread } from './engine';

const TASK_TIMEOUT_MS = 30_000; // 30 seconds

export interface PoolTask {
  id: string;
  file: File;
  options: ConversionOptions;
  onProgress?: (progress: number) => void;
  resolve: (result: ConversionResult) => void;
  reject: (error: ConversionError) => void;
  abortController: AbortController;
}

interface PoolWorkerRecord {
  id: number;
  worker: Worker;
  state: 'idle' | 'busy' | 'terminating' | 'terminated';
  currentTaskId: string | null;
}

interface ActiveTaskRecord {
  task: PoolTask;
  workerRecord?: PoolWorkerRecord;
  timeoutTimer?: ReturnType<typeof setTimeout>;
  isMainThread?: boolean;
}

/**
 * Determine safe concurrency based on hardware and mobile limits.
 */
function getSafeConcurrency(override?: number): number {
  if (override && override > 0) {
    return Math.min(IMAGE_LIMITS.maxConcurrentWorkers, override);
  }
  if (typeof navigator === 'undefined') return 2;
  const hardware = navigator.hardwareConcurrency || 4;
  // Bounded between 1 and maxConcurrentWorkers (default 4)
  return Math.max(1, Math.min(IMAGE_LIMITS.maxConcurrentWorkers, Math.floor(hardware / 2) || 2));
}

export class WorkerPool {
  private maxConcurrency: number;
  private queue: PoolTask[] = [];
  private workers: PoolWorkerRecord[] = [];
  private activeTasks = new Map<string, ActiveTaskRecord>();
  private nextWorkerId = 1;
  private isDestroyed = false;

  constructor(maxConcurrency?: number) {
    this.maxConcurrency = getSafeConcurrency(maxConcurrency);
  }

  public getConcurrency(): number {
    return this.maxConcurrency;
  }

  public setConcurrency(concurrency: number): void {
    this.maxConcurrency = getSafeConcurrency(concurrency);
    this.drainQueue();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getActiveCount(): number {
    return this.activeTasks.size;
  }

  /**
   * Enqueue a new image conversion job into the shared queue.
   */
  public enqueue(
    id: string,
    file: File,
    options: ConversionOptions,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal,
  ): Promise<ConversionResult> {
    if (this.isDestroyed) {
      return Promise.reject(createConversionError('CANCELLED', { userMessage: 'Worker pool was terminated.' }));
    }

    return new Promise<ConversionResult>((resolve, reject) => {
      const abortController = new AbortController();

      if (abortSignal) {
        if (abortSignal.aborted) {
          reject(createConversionError('CANCELLED'));
          return;
        }
        abortSignal.addEventListener('abort', () => {
          abortController.abort();
          this.cancel(id);
        });
      }

      const task: PoolTask = {
        id,
        file,
        options,
        onProgress,
        resolve,
        reject,
        abortController,
      };

      this.queue.push(task);
      this.drainQueue();
    });
  }

  /**
   * Cancel an enqueued or running task.
   */
  public cancel(taskId: string): void {
    // 1. Check pending queue
    const queueIdx = this.queue.findIndex((t) => t.id === taskId);
    if (queueIdx !== -1) {
      const [task] = this.queue.splice(queueIdx, 1);
      task.abortController.abort();
      task.reject(createConversionError('CANCELLED'));
      return;
    }

    // 2. Check active running tasks
    const active = this.activeTasks.get(taskId);
    if (active) {
      this.cancelActiveTask(active);
    }
  }

  /**
   * Cancel all pending and active tasks.
   */
  public cancelAll(): void {
    // Reject and clear pending queue
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task.abortController.abort();
        task.reject(createConversionError('CANCELLED'));
      }
    }

    // Cancel all active tasks
    for (const active of Array.from(this.activeTasks.values())) {
      this.cancelActiveTask(active);
    }

    this.activeTasks.clear();
  }

  /**
   * Cancel a specific active task, terminating its worker and creating a replacement.
   */
  private cancelActiveTask(active: ActiveTaskRecord): void {
    const { task, workerRecord, timeoutTimer } = active;

    if (timeoutTimer) clearTimeout(timeoutTimer);
    task.abortController.abort();
    this.activeTasks.delete(task.id);

    if (workerRecord) {
      this.terminateAndReplaceWorker(workerRecord);
    }

    task.reject(createConversionError('CANCELLED'));
    this.drainQueue();
  }

  /**
   * Process pending queue items while concurrency slots and workers are available.
   */
  private drainQueue(): void {
    if (this.isDestroyed) return;

    while (this.activeTasks.size < this.maxConcurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      if (task.abortController.signal.aborted) {
        task.reject(createConversionError('CANCELLED'));
        continue;
      }

      this.executeTask(task);
    }
  }

  /**
   * Route task to either Web Worker or Main-Thread (for HEIC/HEIF or when Workers are unavailable).
   */
  private async executeTask(task: PoolTask): Promise<void> {
    const isHeic = task.options.inputFormat === 'heic' || task.options.inputFormat === 'heif';
    const hasWorkerSupport = typeof window !== 'undefined' && typeof Worker !== 'undefined';

    if (isHeic || !hasWorkerSupport) {
      this.executeOnMainThread(task);
      return;
    }

    // Acquire or create a reusable worker
    const workerRecord = this.acquireWorker();
    if (!workerRecord) {
      // Fallback to main thread if worker acquisition failed
      this.executeOnMainThread(task);
      return;
    }

    workerRecord.state = 'busy';
    workerRecord.currentTaskId = task.id;

    // Set up watchdog timeout timer
    const timeoutTimer = setTimeout(() => {
      this.handleTaskTimeout(task.id);
    }, TASK_TIMEOUT_MS);

    const activeRecord: ActiveTaskRecord = {
      task,
      workerRecord,
      timeoutTimer,
    };
    this.activeTasks.set(task.id, activeRecord);

    try {
      // Read array buffer to transfer to worker
      const arrayBuffer = await task.file.arrayBuffer();

      if (task.abortController.signal.aborted || this.isDestroyed) {
        this.cleanupActiveRecord(task.id);
        workerRecord.state = 'idle';
        workerRecord.currentTaskId = null;
        task.reject(createConversionError('CANCELLED'));
        this.drainQueue();
        return;
      }

      const request: WorkerRequest = {
        type: 'convert',
        jobId: task.id,
        buffer: arrayBuffer,
        inputFormat: task.options.inputFormat,
        outputFormat: task.options.outputFormat,
        quality: task.options.quality,
        width: task.options.width,
        height: task.options.height,
        maintainAspectRatio: task.options.maintainAspectRatio,
      };

      // Transfer ArrayBuffer for zero-copy off-thread processing
      workerRecord.worker.postMessage(request, [arrayBuffer]);
    } catch {
      // If reading file buffer or posting message failed, release and fallback
      this.cleanupActiveRecord(task.id);
      workerRecord.state = 'idle';
      workerRecord.currentTaskId = null;
      await this.executeOnMainThread(task);
    }
  }

  /**
   * Acquire an existing idle worker or spawn a new one up to maxConcurrency.
   */
  private acquireWorker(): PoolWorkerRecord | null {
    // 1. Try to find an existing idle worker
    const idle = this.workers.find((w) => w.state === 'idle');
    if (idle) {
      return idle;
    }

    // 2. Spawn a new worker if under max concurrency
    if (this.workers.length < this.maxConcurrency) {
      return this.spawnWorker();
    }

    return null;
  }

  /**
   * Spawn a new persistent Web Worker and attach event handlers.
   */
  private spawnWorker(): PoolWorkerRecord | null {
    try {
      const worker = new Worker(
        new URL('./conversion.worker.ts', import.meta.url),
        { type: 'module' },
      );

      const record: PoolWorkerRecord = {
        id: this.nextWorkerId++,
        worker,
        state: 'idle',
        currentTaskId: null,
      };

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(record, event.data);
      };

      worker.onerror = () => {
        this.handleWorkerError(record);
      };

      this.workers.push(record);
      return record;
    } catch {
      return null;
    }
  }

  /**
   * Terminate a worker that crashed or timed out and spawn an idle replacement.
   */
  private terminateAndReplaceWorker(record: PoolWorkerRecord): void {
    record.state = 'terminated';
    try {
      record.worker.terminate();
    } catch {
      // ignore
    }

    const idx = this.workers.indexOf(record);
    if (idx !== -1) {
      this.workers.splice(idx, 1);
    }

    // Spawn a fresh replacement to maintain pool capacity
    if (!this.isDestroyed) {
      this.spawnWorker();
    }
  }

  /**
   * Handle messages received from Web Workers.
   */
  private async handleWorkerMessage(record: PoolWorkerRecord, data: WorkerResponse): Promise<void> {
    if (!data || !data.jobId) return;

    const active = this.activeTasks.get(data.jobId);
    if (!active) return; // Task was already cancelled or completed

    if (data.type === 'progress') {
      active.task.onProgress?.(data.progress);
      return;
    }

    // Task finished (either success or error): clear watchdog timer & active state
    this.cleanupActiveRecord(data.jobId);
    record.state = 'idle';
    record.currentTaskId = null;

    if (data.type === 'success') {
      try {
        let outputBlob = new Blob([data.buffer], { type: data.mimeType });

        // Apply EXIF policy if JPEG output
        if (active.task.options.preserveExif && active.task.options.outputFormat === 'jpg') {
          const sourceBuffer = await active.task.file.arrayBuffer();
          outputBlob = await applyExifPolicy(
            outputBlob,
            sourceBuffer,
            active.task.options.outputFormat,
            {
              preserveExif: true,
              stripGps: active.task.options.stripGps,
            },
          );
        }

        // Generate fresh tracked object URL for final output Blob (fixes EXIF URL bug)
        const objectUrl = createTrackedUrl(outputBlob);
        const filename = generateOutputFilename(
          active.task.file.name,
          active.task.options.outputFormat,
          data.width,
          data.height,
        );

        const result: ConversionResult = {
          jobId: active.task.id,
          blob: outputBlob,
          objectUrl,
          filename,
          mimeType: data.mimeType,
          inputFormat: active.task.options.inputFormat,
          outputFormat: active.task.options.outputFormat,
          originalSize: active.task.file.size,
          outputSize: outputBlob.size,
          originalWidth: data.width,
          originalHeight: data.height,
          outputWidth: data.width,
          outputHeight: data.height,
          width: data.width,
          height: data.height,
          durationMs: data.durationMs,
        };

        active.task.resolve(result);
      } catch (err) {
        active.task.reject(
          createConversionError('ENCODE_FAILED', {
            message: err instanceof Error ? err.message : 'Blob finalization failed',
          }),
        );
      }
    } else if (data.type === 'error') {
      active.task.reject(
        createConversionError(data.errorCode || 'WORKER_ERROR', {
          userMessage: data.error,
        }),
      );
    }

    this.drainQueue();
  }

  /**
   * Handle unexpected worker crash or runtime script failure.
   */
  private handleWorkerError(record: PoolWorkerRecord): void {
    const taskId = record.currentTaskId;
    this.terminateAndReplaceWorker(record);

    if (taskId) {
      const active = this.activeTasks.get(taskId);
      if (active) {
        this.cleanupActiveRecord(taskId);
        // Fallback to main thread execution for this specific task
        this.executeOnMainThread(active.task);
      }
    }

    this.drainQueue();
  }

  /**
   * Handle task watchdog timeout.
   */
  private handleTaskTimeout(taskId: string): void {
    const active = this.activeTasks.get(taskId);
    if (!active) return;

    this.cleanupActiveRecord(taskId);

    if (active.workerRecord) {
      this.terminateAndReplaceWorker(active.workerRecord);
    }

    active.task.reject(
      createConversionError('TIMEOUT', {
        userMessage: 'Conversion timed out after 30 seconds.',
        recoveryAction: 'Try converting a smaller image or reducing dimensions.',
      }),
    );

    this.drainQueue();
  }

  /**
   * Execute task directly on the main thread (for HEIC/HEIF or worker fallbacks).
   */
  private async executeOnMainThread(task: PoolTask): Promise<void> {
    const timeoutTimer = setTimeout(() => {
      this.handleTaskTimeout(task.id);
    }, TASK_TIMEOUT_MS);

    const activeRecord: ActiveTaskRecord = {
      task,
      timeoutTimer,
      isMainThread: true,
    };
    this.activeTasks.set(task.id, activeRecord);

    try {
      const result = await convertImageMainThread(
        task.file,
        task.options,
        task.onProgress,
        task.abortController.signal,
      );

      // Apply EXIF policy if JPEG output
      if (task.options.preserveExif && task.options.outputFormat === 'jpg') {
        const sourceBuffer = await task.file.arrayBuffer();
        const updatedBlob = await applyExifPolicy(
          result.blob,
          sourceBuffer,
          task.options.outputFormat,
          {
            preserveExif: true,
            stripGps: task.options.stripGps,
          },
        );
        result.blob = updatedBlob;
        result.outputSize = updatedBlob.size;
        // Fix EXIF URL bug: regenerate objectUrl and revoke the previous URL
        result.objectUrl = replaceTrackedUrl(result.objectUrl, updatedBlob);
      }

      result.jobId = task.id;
      this.cleanupActiveRecord(task.id);
      task.resolve(result);
    } catch (err) {
      this.cleanupActiveRecord(task.id);
      if (task.abortController.signal.aborted) {
        task.reject(createConversionError('CANCELLED'));
      } else {
        const convError =
          typeof err === 'object' && err !== null && 'code' in err
            ? (err as ConversionError)
            : createConversionError('ENCODE_FAILED', {
                message: err instanceof Error ? err.message : 'Main thread conversion error',
              });
        task.reject(convError);
      }
    } finally {
      this.drainQueue();
    }
  }

  /**
   * Clear watchdog timer and remove task from active map.
   */
  private cleanupActiveRecord(taskId: string): void {
    const active = this.activeTasks.get(taskId);
    if (active) {
      if (active.timeoutTimer) clearTimeout(active.timeoutTimer);
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * Tear down the entire worker pool.
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.cancelAll();
    for (const record of this.workers) {
      try {
        record.worker.terminate();
      } catch {
        // ignore
      }
    }
    this.workers = [];
  }
}

// Global reusable singleton instance with safe bounded concurrency
export const globalWorkerPool = new WorkerPool();
