/**
 * Conversion Engine — the core conversion pipeline.
 * Runs in the main thread but delegates heavy work to the canvas API.
 * For HEIC, dynamically loads heic2any.
 *
 * This module is framework-agnostic and does not import React.
 */

import type {
  InputFormat,
  OutputFormat,
  ConversionOptions,
  ConversionResult,
  ConversionError,
} from '../types';
import { FORMAT_MIME_MAP } from '../types';
import { generateOutputFilename } from '../formats';
import { IMAGE_LIMITS } from '../constants';

/**
 * Convert an image file to the target format.
 * Returns a ConversionResult on success or throws a ConversionError.
 */
export async function convertImage(
  file: File,
  options: ConversionOptions,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
): Promise<ConversionResult> {
  const startTime = performance.now();

  onProgress?.(0.05);

  if (abortSignal?.aborted) {
    throw createError('cancelled');
  }

  // Step 1: Decode image to ImageBitmap
  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeImage(file, options.inputFormat, onProgress, abortSignal);
  } catch (err) {
    if (abortSignal?.aborted) throw createError('cancelled');
    if (isConversionError(err)) throw err;
    throw createError('decode_failure', err);
  }

  onProgress?.(0.4);

  if (abortSignal?.aborted) {
    bitmap.close();
    throw createError('cancelled');
  }

  // Step 2: Calculate output dimensions
  const { width: outputWidth, height: outputHeight } = calculateOutputDimensions(
    bitmap.width,
    bitmap.height,
    options,
  );

  // Check output dimensions safety
  if (outputWidth * outputHeight > IMAGE_LIMITS.maxPixels) {
    bitmap.close();
    throw createError('dimensions_too_large');
  }

  onProgress?.(0.5);

  // Step 3: Draw to OffscreenCanvas and encode
  let outputBlob: Blob;
  try {
    outputBlob = await encodeImage(
      bitmap,
      outputWidth,
      outputHeight,
      options.outputFormat,
      options.quality,
    );
  } catch (err) {
    bitmap.close();
    if (abortSignal?.aborted) throw createError('cancelled');
    throw createError('encode_failure', err);
  }

  onProgress?.(0.9);

  // Step 4: Clean up bitmap
  bitmap.close();

  if (abortSignal?.aborted) {
    throw createError('cancelled');
  }

  // Step 5: Build result
  const objectUrl = URL.createObjectURL(outputBlob);
  const filename = generateOutputFilename(
    file.name,
    options.outputFormat,
    options.width || options.height ? outputWidth : undefined,
    options.width || options.height ? outputHeight : undefined,
  );

  onProgress?.(1);

  const result: ConversionResult = {
    blob: outputBlob,
    filename,
    mimeType: FORMAT_MIME_MAP[options.outputFormat],
    originalSize: file.size,
    outputSize: outputBlob.size,
    originalWidth: bitmap.width || outputWidth,
    originalHeight: bitmap.height || outputHeight,
    outputWidth,
    outputHeight,
    durationMs: Math.round(performance.now() - startTime),
    objectUrl,
  };

  return result;
}

/**
 * Decode an image file to an ImageBitmap.
 * Handles HEIC/HEIF via dynamic import of heic2any.
 */
async function decodeImage(
  file: File,
  inputFormat: InputFormat,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
): Promise<ImageBitmap> {
  // HEIC/HEIF requires special handling
  if (inputFormat === 'heic' || inputFormat === 'heif') {
    onProgress?.(0.1);

    // Dynamically import heic2any only when needed
    const heic2any = (await import('heic2any')).default;

    if (abortSignal?.aborted) throw createError('cancelled');

    onProgress?.(0.2);

    // Convert HEIC to a standard Blob (PNG)
    const result = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 1,
    });

    if (abortSignal?.aborted) throw createError('cancelled');

    onProgress?.(0.3);

    const blob = Array.isArray(result) ? result[0] : result;
    return createImageBitmap(blob);
  }

  // Standard web formats — browser can decode directly
  onProgress?.(0.15);
  return createImageBitmap(file);
}

/**
 * Encode an ImageBitmap to the target format using OffscreenCanvas.
 * Falls back to regular Canvas if OffscreenCanvas is not available.
 */
async function encodeImage(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const mimeType = FORMAT_MIME_MAP[format];

  // Try OffscreenCanvas first (works in Web Workers)
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    ctx.drawImage(bitmap, 0, 0, width, height);

    // PNG is lossless — don't pass quality
    if (format === 'png') {
      return canvas.convertToBlob({ type: mimeType });
    }

    return canvas.convertToBlob({ type: mimeType, quality });
  }

  // Fallback: regular canvas (SSR-safe check)
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    ctx.drawImage(bitmap, 0, 0, width, height);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas encoding failed'));
        },
        mimeType,
        format === 'png' ? undefined : quality,
      );
    });
  }

  throw new Error('No canvas support available');
}

/**
 * Calculate output dimensions respecting aspect ratio and resize options.
 */
function calculateOutputDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ConversionOptions,
): { width: number; height: number } {
  // No resize requested
  if (!options.width && !options.height) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (options.maintainAspectRatio) {
    if (options.width && !options.height) {
      return {
        width: Math.round(options.width),
        height: Math.round(options.width / aspectRatio),
      };
    }
    if (options.height && !options.width) {
      return {
        width: Math.round(options.height * aspectRatio),
        height: Math.round(options.height),
      };
    }
    if (options.width && options.height) {
      // Fit within box
      const scaleW = options.width / originalWidth;
      const scaleH = options.height / originalHeight;
      const scale = Math.min(scaleW, scaleH);
      return {
        width: Math.round(originalWidth * scale),
        height: Math.round(originalHeight * scale),
      };
    }
  }

  return {
    width: options.width || originalWidth,
    height: options.height || originalHeight,
  };
}

/**
 * Check if AVIF encoding is supported by the current browser.
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
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/avif', 0.5);
    return dataUrl.startsWith('data:image/avif');
  }

  return false;
}

/**
 * Clean up a conversion result's resources.
 */
export function cleanupResult(result: ConversionResult): void {
  if (result.objectUrl) {
    URL.revokeObjectURL(result.objectUrl);
  }
}

/* ─── Error Helpers ─── */

function createError(type: ConversionError['type'], cause?: unknown): ConversionError {
  const messages: Record<string, { user: string; recovery?: string }> = {
    cancelled: { user: 'Conversion was cancelled.' },
    decode_failure: {
      user: "We couldn't read this image file.",
      recovery: 'The file may be corrupted or unsupported. Try another file.',
    },
    encode_failure: {
      user: "We couldn't encode the image in this format.",
      recovery: 'Try a different output format or reduce the image size.',
    },
    browser_limitation: {
      user: 'Your browser does not support this conversion.',
      recovery: 'Try using Chrome or Edge for the best compatibility.',
    },
    dimensions_too_large: {
      user: "This image's dimensions exceed the safe processing limit.",
      recovery: 'Try a smaller image.',
    },
    memory_limitation: {
      user: 'Not enough memory to process this image.',
      recovery: 'Close other tabs and try again, or use a smaller image.',
    },
    worker_failure: {
      user: 'An internal processing error occurred.',
      recovery: 'Please try again.',
    },
    unknown: {
      user: "We couldn't convert this image.",
      recovery: 'Try another file.',
    },
  };

  const msg = messages[type] || messages.unknown;

  return {
    type: type as ConversionError['type'],
    message: cause instanceof Error ? cause.message : String(cause ?? type),
    userMessage: msg.user,
    recoveryAction: msg.recovery,
    technicalDetails: cause instanceof Error ? cause.stack : undefined,
  };
}

function isConversionError(err: unknown): err is ConversionError {
  return typeof err === 'object' && err !== null && 'type' in err && 'userMessage' in err;
}
