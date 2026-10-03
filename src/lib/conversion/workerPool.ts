import type {
  ConversionOptions,
  ConversionResult,
  ConversionError,
  WorkerRequest,
  WorkerResponse,
} from '../types';
import { generateOutputFilename } from '../formats';
import { convertImage } from './engine';
import { applyExifPolicy } from './exif';

export interface PoolTask {
  id: string;
  file: File;
  options: ConversionOptions & { preserveExif?: boolean; stripGps?: boolean };
  onProgress?: (progress: number) => void;
  resolve: (result: ConversionResult) => void;
  reject: (error: ConversionError) => void;
  abortController: AbortController;
}

interface ActiveWorker {
  worker: Worker;
  currentTaskId: string | null;
}

export class WorkerPool {
  private maxConcurrency: number;
  private queue: PoolTask[] = [];
  private activeWorkers: ActiveWorker[] = [];
  private activeTasksCount = 0;
  private isDestroyed = false;

  constructor(maxConcurrency: number = 3) {
    this.maxConcurrency = maxConcurrency;
  }

  public setConcurrency(concurrency: number): void {
    this.maxConcurrency = Math.max(1, concurrency);
    this.drainQueue();
  }

  public getConcurrency(): number {
    return this.maxConcurrency;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getActiveCount(): number {
    return this.activeTasksCount;
  }

  /**
   * Enqueue a new image conversion task
   */
  public enqueue(
    id: string,
    file: File,
    options: ConversionOptions & { preserveExif?: boolean; stripGps?: boolean },
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal,
  ): Promise<ConversionResult> {
    return new Promise<ConversionResult>((resolve, reject) => {
      const abortController = new AbortController();

      if (abortSignal) {
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
   * Cancel a specific queued or active task
   */
  public cancel(taskId: string): void {
    // 1. Remove from pending queue
    const queueIdx = this.queue.findIndex((t) => t.id === taskId);
    if (queueIdx !== -1) {
      const [task] = this.queue.splice(queueIdx, 1);
      task.abortController.abort();
      task.reject({
        type: 'cancelled',
        message: 'Conversion cancelled by user',
        userMessage: 'Conversion cancelled',
      });
      return;
    }

    // 2. Terminate active worker processing this task
    const activeIdx = this.activeWorkers.findIndex((w) => w.currentTaskId === taskId);
    if (activeIdx !== -1) {
      const active = this.activeWorkers[activeIdx];
      active.worker.terminate();
      this.activeWorkers.splice(activeIdx, 1);
      this.activeTasksCount = Math.max(0, this.activeTasksCount - 1);
      this.drainQueue();
    }
  }

  /**
   * Cancel all pending and active tasks
   */
  public cancelAll(): void {
    // Drain pending queue
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task.abortController.abort();
        task.reject({
          type: 'cancelled',
          message: 'Conversion cancelled by user',
          userMessage: 'Conversion cancelled',
        });
      }
    }

    // Terminate all workers
    for (const active of this.activeWorkers) {
      active.worker.terminate();
    }
    this.activeWorkers = [];
    this.activeTasksCount = 0;
  }

  /**
   * Process next items in the queue
   */
  private drainQueue(): void {
    if (this.isDestroyed) return;

    while (this.activeTasksCount < this.maxConcurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      if (task.abortController.signal.aborted) {
        task.reject({
          type: 'cancelled',
          message: 'Task was cancelled',
          userMessage: 'Conversion cancelled',
        });
        continue;
      }

      this.activeTasksCount++;
      this.runTask(task);
    }
  }

  /**
   * Run a task using an available Web Worker or main-thread fallback
   */
  private async runTask(task: PoolTask): Promise<void> {
    // HEIC conversion requires heic2any which runs best in main thread or async engine
    const isHeic = task.options.inputFormat === 'heic' || task.options.inputFormat === 'heif';

    if (isHeic || typeof window === 'undefined' || typeof Worker === 'undefined') {
      await this.runOnMainThread(task);
      return;
    }

    try {
      // Create or reuse worker
      const worker = new Worker(
        new URL('./conversion.worker.ts', import.meta.url),
        { type: 'module' }
      );

      const activeRecord: ActiveWorker = {
        worker,
        currentTaskId: task.id,
      };
      this.activeWorkers.push(activeRecord);

      const arrayBuffer = await task.file.arrayBuffer();

      worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
        const data = event.data;

        if (data.type === 'progress') {
          task.onProgress?.(data.progress);
        } else if (data.type === 'success') {
          this.cleanupWorker(activeRecord);

          try {
            let outputBlob = new Blob([data.buffer], { type: data.mimeType });

            // Apply EXIF policy (preservation / GPS sanitization)
            if (task.options.preserveExif) {
              outputBlob = await applyExifPolicy(
                outputBlob,
                arrayBuffer,
                task.options.outputFormat,
                {
                  preserveExif: true,
                  stripGps: task.options.stripGps,
                }
              );
            }

            const objectUrl = URL.createObjectURL(outputBlob);
            const filename = generateOutputFilename(
              task.file.name,
              task.options.outputFormat,
              data.width,
              data.height
            );

            const result: ConversionResult = {
              blob: outputBlob,
              filename,
              mimeType: data.mimeType,
              originalSize: task.file.size,
              outputSize: outputBlob.size,
              originalWidth: data.width,
              originalHeight: data.height,
              outputWidth: data.width,
              outputHeight: data.height,
              durationMs: data.durationMs,
              objectUrl,
            };

            task.resolve(result);
          } catch (e) {
            task.reject({
              type: 'encode_failure',
              message: e instanceof Error ? e.message : 'Failed to finalize output blob',
              userMessage: 'Failed to complete image conversion.',
            });
          }

          this.drainQueue();
        } else if (data.type === 'error') {
          this.cleanupWorker(activeRecord);
          task.reject({
            type: data.errorType || 'worker_failure',
            message: data.error,
            userMessage: data.error,
          });
          this.drainQueue();
        }
      };

      worker.onerror = (err) => {
        this.cleanupWorker(activeRecord);
        // Fall back to main thread engine on worker failure
        this.runOnMainThread(task);
      };

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

      worker.postMessage(request, [arrayBuffer]);
    } catch {
      // Fall back to main thread
      await this.runOnMainThread(task);
    }
  }

  private async runOnMainThread(task: PoolTask): Promise<void> {
    try {
      const result = await convertImage(
        task.file,
        task.options,
        task.onProgress,
        task.abortController.signal
      );

      // Apply EXIF if requested
      if (task.options.preserveExif && (task.options.outputFormat === 'jpg')) {
        const sourceBuffer = await task.file.arrayBuffer();
        const updatedBlob = await applyExifPolicy(
          result.blob,
          sourceBuffer,
          task.options.outputFormat,
          { preserveExif: true, stripGps: task.options.stripGps }
        );
        result.blob = updatedBlob;
        result.outputSize = updatedBlob.size;
      }

      task.resolve(result);
    } catch (err) {
      task.reject({
        type: 'encode_failure',
        message: err instanceof Error ? err.message : 'Main thread conversion error',
        userMessage: 'We could not convert this file.',
      });
    } finally {
      this.activeTasksCount = Math.max(0, this.activeTasksCount - 1);
      this.drainQueue();
    }
  }

  private cleanupWorker(activeRecord: ActiveWorker): void {
    activeRecord.worker.terminate();
    const idx = this.activeWorkers.indexOf(activeRecord);
    if (idx !== -1) {
      this.activeWorkers.splice(idx, 1);
    }
    this.activeTasksCount = Math.max(0, this.activeTasksCount - 1);
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.cancelAll();
  }
}

// Global singleton instance with high-speed multi-threaded concurrency (6 workers)
export const globalWorkerPool = new WorkerPool(6);
