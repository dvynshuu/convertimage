'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  OutputFormat,
  InputFormat,
  ConversionResult,
  ConversionError,
  ResizePreset,
} from '@/lib/types';
import { validateFile, calculateSavings } from '@/lib/formats';
import { DEFAULT_QUALITY, IMAGE_LIMITS } from '@/lib/constants';
import { globalWorkerPool } from '@/lib/conversion/workerPool';
import { executeConversionJob } from '@/lib/conversion/pipeline';
import { downloadZip, type ZipFileItem } from '@/lib/conversion/zip';
import { createConversionError } from '@/lib/errors';
import { createTrackedUrl, revokeTrackedUrl } from '@/lib/objectUrls';

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  inputFormat: InputFormat;
  status: 'pending' | 'processing' | 'success' | 'error' | 'cancelled';
  progress: number;
  previewUrl: string;
  result?: ConversionResult;
  error?: ConversionError;
}

export interface UseBatchConverterReturn {
  items: BatchItem[];
  outputFormat: OutputFormat;
  quality: number;
  preserveExif: boolean;
  stripGps: boolean;
  resizePreset: ResizePreset;
  customWidth: number | undefined;
  customHeight: number | undefined;
  maintainAspectRatio: boolean;

  isConverting: boolean;
  isZipGenerating: boolean;
  zipProgress: number;

  totalCount: number;
  pendingCount: number;
  processingCount: number;
  successCount: number;
  errorCount: number;
  totalOriginalSize: number;
  completedOriginalSize: number;
  completedOutputSize: number;
  savingsPercentage: number;
  isSmaller: boolean;
  isIdentical: boolean;

  setOutputFormat: (f: OutputFormat) => void;
  setQuality: (q: number) => void;
  setPreserveExif: (preserve: boolean) => void;
  setStripGps: (strip: boolean) => void;
  setResizePreset: (p: ResizePreset) => void;
  setCustomWidth: (w: number | undefined) => void;
  setCustomHeight: (h: number | undefined) => void;
  setMaintainAspectRatio: (lock: boolean) => void;

  addFiles: (files: File[], maxLimit?: number) => Promise<{ added: number; skipped: number; hitLimit: boolean }>;
  removeItem: (id: string) => void;
  clearAll: () => void;
  convertAll: () => Promise<void>;
  cancelAll: () => void;
  cancelItem: (id: string) => void;
  downloadAllZip: () => Promise<void>;
  downloadSingle: (id: string) => void;
}

export function useBatchConverter(
  initialOutputFormat: OutputFormat = 'webp',
): UseBatchConverterReturn {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [outputFormat, setOutputFormatState] = useState<OutputFormat>(initialOutputFormat);
  const [quality, setQuality] = useState<number>(DEFAULT_QUALITY[initialOutputFormat]);
  const [preserveExif, setPreserveExif] = useState(false);
  const [stripGps, setStripGps] = useState(true);
  const [resizePreset, setResizePreset] = useState<ResizePreset>('original');
  const [customWidth, setCustomWidth] = useState<number | undefined>(undefined);
  const [customHeight, setCustomHeight] = useState<number | undefined>(undefined);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const [isConverting, setIsConverting] = useState(false);
  const [isZipGenerating, setIsZipGenerating] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const trackedUrlsRef = useRef<Set<string>>(new Set());

  // Clean up Object URLs when unmounting
  useEffect(() => {
    const urls = trackedUrlsRef.current;
    return () => {
      urls.forEach((url) => revokeTrackedUrl(url));
      urls.clear();
      globalWorkerPool.cancelAll();
    };
  }, []);

  const setOutputFormat = useCallback((format: OutputFormat) => {
    setOutputFormatState(format);
    setQuality(DEFAULT_QUALITY[format]);
  }, []);

  /**
   * Add files to batch queue with validation and honest capacity limits.
   * Unknown formats are rejected immediately (Rule 5: never default to jpg).
   */
  const addFiles = useCallback(
    async (
      newFiles: File[],
      maxLimit: number = IMAGE_LIMITS.maxBatchFiles,
    ): Promise<{ added: number; skipped: number; hitLimit: boolean }> => {
      const currentCount = items.length;
      const effectiveLimit = Math.min(maxLimit, IMAGE_LIMITS.maxBatchFiles);
      const availableSlots = Math.max(0, effectiveLimit - currentCount);

      const filesToProcess = newFiles.slice(0, availableSlots);
      const skipped = newFiles.length - filesToProcess.length;
      const hitLimit = skipped > 0;

      const createdItems: BatchItem[] = [];

      for (const file of filesToProcess) {
        const previewUrl = createTrackedUrl(file);
        trackedUrlsRef.current.add(previewUrl);

        // Canonical validation
        const validation = await validateFile(file);

        if (!validation.valid || !validation.format) {
          // Reject unknown or corrupted formats without defaulting to JPG
          createdItems.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            name: file.name,
            originalSize: file.size,
            inputFormat: 'jpg',
            status: 'error',
            progress: 0,
            previewUrl,
            error: validation.error || createConversionError('UNSUPPORTED_FORMAT'),
          });
        } else {
          createdItems.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            name: file.name,
            originalSize: file.size,
            inputFormat: validation.format,
            status: 'pending',
            progress: 0,
            previewUrl,
          });
        }
      }

      setItems((prev) => [...prev, ...createdItems]);
      return { added: createdItems.length, skipped, hitLimit };
    },
    [items.length],
  );

  const removeItem = useCallback((id: string) => {
    globalWorkerPool.cancel(id);
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        revokeTrackedUrl(target.previewUrl);
        trackedUrlsRef.current.delete(target.previewUrl);
        if (target.result?.objectUrl) {
          revokeTrackedUrl(target.result.objectUrl);
          trackedUrlsRef.current.delete(target.result.objectUrl);
        }
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    globalWorkerPool.cancelAll();
    setItems((prev) => {
      prev.forEach((item) => {
        revokeTrackedUrl(item.previewUrl);
        trackedUrlsRef.current.delete(item.previewUrl);
        if (item.result?.objectUrl) {
          revokeTrackedUrl(item.result.objectUrl);
          trackedUrlsRef.current.delete(item.result.objectUrl);
        }
      });
      return [];
    });
    setIsConverting(false);
  }, []);

  const cancelItem = useCallback((id: string) => {
    globalWorkerPool.cancel(id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'cancelled', progress: 0 } : item,
      ),
    );
  }, []);

  const cancelAll = useCallback(() => {
    globalWorkerPool.cancelAll();
    setItems((prev) =>
      prev.map((item) =>
        item.status === 'processing' || item.status === 'pending'
          ? { ...item, status: 'cancelled', progress: 0 }
          : item,
      ),
    );
    setIsConverting(false);
  }, []);

  /**
   * Convert all pending/cancelled items using the canonical pipeline.
   */
  const convertAll = useCallback(async () => {
    const pendingItems = items.filter(
      (item) => item.status === 'pending' || item.status === 'cancelled' || item.status === 'error',
    );

    if (pendingItems.length === 0) return;

    setIsConverting(true);

    // Update statuses to pending in UI
    setItems((prev) =>
      prev.map((item) =>
        pendingItems.some((p) => p.id === item.id)
          ? { ...item, status: 'pending', progress: 0, error: undefined }
          : item,
      ),
    );

    const conversionPromises = pendingItems.map(async (item) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i)),
      );

      try {
        const result = await executeConversionJob(
          item.id,
          item.file,
          {
            inputFormat: item.inputFormat,
            outputFormat,
            quality,
            width: customWidth,
            height: customHeight,
            resizePreset,
            maintainAspectRatio,
            preserveExif,
            stripGps,
          },
          (progress) => {
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, progress } : i)),
            );
          },
        );

        if (result.objectUrl) {
          trackedUrlsRef.current.add(result.objectUrl);
        }

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'success', progress: 1, result }
              : i,
          ),
        );
      } catch (err) {
        const error: ConversionError =
          typeof err === 'object' && err !== null && 'code' in err
            ? (err as ConversionError)
            : createConversionError('ENCODE_FAILED', {
                message: err instanceof Error ? err.message : 'Batch conversion failed',
              });

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'error', progress: 0, error } : i,
          ),
        );
      }
    });

    await Promise.allSettled(conversionPromises);
    setIsConverting(false);
  }, [
    items,
    outputFormat,
    quality,
    customWidth,
    customHeight,
    maintainAspectRatio,
    preserveExif,
    stripGps,
    resizePreset,
  ]);

  const downloadSingle = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item?.result?.objectUrl) {
        const a = document.createElement('a');
        a.href = item.result.objectUrl;
        a.download = item.result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    },
    [items],
  );

  const downloadAllZip = useCallback(async () => {
    const successItems: ZipFileItem[] = items
      .filter((item) => item.status === 'success' && item.result)
      .map((item) => ({
        filename: item.result!.filename,
        blob: item.result!.blob,
      }));

    if (successItems.length === 0) return;

    setIsZipGenerating(true);
    setZipProgress(0);

    try {
      await downloadZip(successItems, 'convertimage-converted-images.zip', (percent) => {
        setZipProgress(percent);
      });
    } finally {
      setIsZipGenerating(false);
      setZipProgress(0);
    }
  }, [items]);

  // Derived metrics
  const totalCount = items.length;
  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const processingCount = items.filter((i) => i.status === 'processing').length;
  const successCount = items.filter((i) => i.status === 'success').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  const totalOriginalSize = items.reduce((acc, i) => acc + i.originalSize, 0);

  // Accurate savings calculation only on completed files (Rule 30)
  const completedItems = items.filter((i) => i.status === 'success' && i.result);
  const completedOriginalSize = completedItems.reduce((acc, i) => acc + i.originalSize, 0);
  const completedOutputSize = completedItems.reduce(
    (acc, i) => acc + (i.result ? i.result.outputSize : 0),
    0,
  );

  const savings = calculateSavings(completedOriginalSize, completedOutputSize);

  return {
    items,
    outputFormat,
    quality,
    preserveExif,
    stripGps,
    resizePreset,
    customWidth,
    customHeight,
    maintainAspectRatio,
    isConverting,
    isZipGenerating,
    zipProgress,
    totalCount,
    pendingCount,
    processingCount,
    successCount,
    errorCount,
    totalOriginalSize,
    completedOriginalSize,
    completedOutputSize,
    savingsPercentage: savings.percentage,
    isSmaller: savings.isSmaller,
    isIdentical: savings.isIdentical,
    setOutputFormat,
    setQuality,
    setPreserveExif,
    setStripGps,
    setResizePreset,
    setCustomWidth,
    setCustomHeight,
    setMaintainAspectRatio,
    addFiles,
    removeItem,
    clearAll,
    convertAll,
    cancelAll,
    cancelItem,
    downloadAllZip,
    downloadSingle,
  };
}
