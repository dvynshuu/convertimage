/**
 * Conversion Engine — Decoder and Rendering Pipeline.
 *
 * Implements main-thread decoding, specialized HEIC lazy-loaded pipeline,
 * and canonical canvas rendering with identical pixel behavior to workers.
 */

import type {
  InputFormat,
  OutputFormat,
  ConversionOptions,
  ConversionResult,
} from '../types';
import { FORMAT_MIME_MAP } from '../types';
import { generateOutputFilename, calculateResizeDimensions } from '../formats';
import { IMAGE_LIMITS } from '../constants';
import { createConversionError } from '../errors';
import { createTrackedUrl } from '../objectUrls';
import { decodeHeicToBitmap } from './heicDecoder';

/**
 * Render an ImageBitmap to a canvas with canonical background and smoothing.
 * Enforces identical pixel behavior for JPG background between single and batch.
 */
export function renderToCanvas(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  outputFormat: OutputFormat,
): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Failed to acquire OffscreenCanvas 2D context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (outputFormat === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas;
  }

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Failed to acquire Canvas 2D context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (outputFormat === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas;
  }

  throw new Error('No canvas support available in this environment');
}

/**
 * Convert canvas to Blob in target format.
 */
export async function canvasToBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const mimeType = FORMAT_MIME_MAP[format] || 'image/jpeg';
  const encodeQuality = format === 'png' ? undefined : quality;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({
      type: mimeType,
      quality: encodeQuality,
    });
  }

  return new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas encoding returned null'));
      },
      mimeType,
      encodeQuality,
    );
  });
}

/**
 * Decode an image file to an ImageBitmap.
 * Handles HEIC/HEIF via lazy-loaded dynamic import of heic2any.
 */
export async function decodeImage(
  file: File,
  inputFormat: InputFormat,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
): Promise<ImageBitmap> {
  if (abortSignal?.aborted) {
    throw createConversionError('CANCELLED');
  }

  // Specialized HEIC/HEIF multi-tier resilient pipeline
  if (inputFormat === 'heic' || inputFormat === 'heif') {
    return await decodeHeicToBitmap(file, { onProgress, abortSignal });
  }

  // Standard web formats
  onProgress?.(0.15);
  try {
    return await createImageBitmap(file);
  } catch (err) {
    if (abortSignal?.aborted) throw createConversionError('CANCELLED');
    throw createConversionError('DECODE_FAILED', {
      message: err instanceof Error ? err.message : 'createImageBitmap failed',
    });
  }
}

/**
 * Main-thread conversion execution (used for HEIC/HEIF and worker fallback).
 */
export async function convertImageMainThread(
  file: File,
  options: ConversionOptions,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
): Promise<ConversionResult> {
  const startTime = performance.now();

  onProgress?.(0.05);
  if (abortSignal?.aborted) throw createConversionError('CANCELLED');

  // Step 1: Decode
  const bitmap = await decodeImage(file, options.inputFormat, onProgress, abortSignal);

  onProgress?.(0.4);
  if (abortSignal?.aborted) {
    bitmap.close();
    throw createConversionError('CANCELLED');
  }

  // Step 2: Calculate target dimensions
  const dims = calculateResizeDimensions(bitmap.width, bitmap.height, {
    width: options.width,
    height: options.height,
    preset: options.resizePreset,
    maintainAspectRatio: options.maintainAspectRatio,
  });

  const outputWidth = dims.width;
  const outputHeight = dims.height;

  if (outputWidth * outputHeight > IMAGE_LIMITS.maxPixels) {
    bitmap.close();
    throw createConversionError('IMAGE_TOO_LARGE');
  }

  onProgress?.(0.55);

  // Step 3: Render to canvas and encode
  let outputBlob: Blob;
  try {
    const canvas = renderToCanvas(bitmap, outputWidth, outputHeight, options.outputFormat);
    outputBlob = await canvasToBlob(canvas, options.outputFormat, options.quality);
  } catch (err) {
    bitmap.close();
    if (abortSignal?.aborted) throw createConversionError('CANCELLED');
    throw createConversionError('ENCODE_FAILED', {
      message: err instanceof Error ? err.message : 'Canvas encoding error',
    });
  }

  bitmap.close();
  onProgress?.(0.9);

  if (abortSignal?.aborted) {
    throw createConversionError('CANCELLED');
  }

  const objectUrl = createTrackedUrl(outputBlob);
  const filename = generateOutputFilename(
    file.name,
    options.outputFormat,
    options.width || options.height ? outputWidth : undefined,
    options.width || options.height ? outputHeight : undefined,
  );

  onProgress?.(1.0);

  return {
    blob: outputBlob,
    objectUrl,
    filename,
    mimeType: FORMAT_MIME_MAP[options.outputFormat] || 'image/jpeg',
    inputFormat: options.inputFormat,
    outputFormat: options.outputFormat,
    originalSize: file.size,
    outputSize: outputBlob.size,
    originalWidth: bitmap.width || outputWidth,
    originalHeight: bitmap.height || outputHeight,
    outputWidth,
    outputHeight,
    width: outputWidth,
    height: outputHeight,
    durationMs: Math.round(performance.now() - startTime),
  };
}

/**
 * Check if AVIF encoding is actually supported by the current browser.
 * Uses progressive capability detection at runtime.
 */
export async function checkAvifSupport(): Promise<boolean> {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const canvas = new OffscreenCanvas(1, 1);
      const blob = await canvas.convertToBlob({ type: 'image/avif', quality: 0.5 });
      return blob.type === 'image/avif';
    } catch {
      return false;
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataUrl = canvas.toDataURL('image/avif', 0.5);
      return dataUrl.startsWith('data:image/avif');
    } catch {
      return false;
    }
  }

  return false;
}
