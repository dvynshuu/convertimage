import type {
  InputFormat,
  OutputFormat,
  ValidationResult,
  ResizePreset,
} from './types';
import { MIME_FORMAT_MAP, FORMAT_EXTENSIONS } from './types';
import { IMAGE_LIMITS, ACCEPTED_EXTENSIONS } from './constants';
import { createConversionError } from './errors';

/**
 * Detect format from magic bytes (file header).
 * Inspects signatures and ISO BMFF container brands.
 */
export function detectFormatFromBytes(buffer: ArrayBuffer): InputFormat | null {
  if (!buffer || buffer.byteLength < 4) return null;
  const view = new Uint8Array(buffer.slice(0, Math.min(64, buffer.byteLength)));

  // JPEG: FF D8 FF
  if (view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    view.length >= 8 &&
    view[0] === 0x89 &&
    view[1] === 0x50 &&
    view[2] === 0x4e &&
    view[3] === 0x47 &&
    view[4] === 0x0d &&
    view[5] === 0x0a &&
    view[6] === 0x1a &&
    view[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF....WEBP
  if (
    view.length >= 12 &&
    view[0] === 0x52 &&
    view[1] === 0x49 &&
    view[2] === 0x46 &&
    view[3] === 0x46 &&
    view[8] === 0x57 &&
    view[9] === 0x45 &&
    view[10] === 0x42 &&
    view[11] === 0x50
  ) {
    return 'webp';
  }

  // HEIC/HEIF/AVIF — ISO Base Media File Format (ISOBMFF) container with 'ftyp' box
  if (
    view.length >= 12 &&
    view[4] === 0x66 &&
    view[5] === 0x74 &&
    view[6] === 0x79 &&
    view[7] === 0x70
  ) {
    // Major brand (bytes 8-11)
    const majorBrand = String.fromCharCode(view[8], view[9], view[10], view[11]).toLowerCase();

    if (majorBrand === 'avif' || majorBrand === 'avis') return 'avif';
    if (majorBrand === 'heic' || majorBrand === 'heix' || majorBrand === 'heim' || majorBrand === 'heis') return 'heic';
    if (majorBrand === 'heif' || majorBrand === 'hevx' || majorBrand === 'mif1' || majorBrand === 'msf1') return 'heif';

    // Scan compatible brands list (bytes 16 onwards in 4-byte strides)
    for (let offset = 16; offset + 4 <= view.length; offset += 4) {
      const compatBrand = String.fromCharCode(
        view[offset],
        view[offset + 1],
        view[offset + 2],
        view[offset + 3],
      ).toLowerCase();
      if (compatBrand === 'avif' || compatBrand === 'avis') return 'avif';
      if (compatBrand === 'heic' || compatBrand === 'heix' || compatBrand === 'heim' || compatBrand === 'heis') return 'heic';
      if (compatBrand === 'heif' || compatBrand === 'hevx' || compatBrand === 'mif1' || compatBrand === 'msf1') return 'heif';
    }
  }

  return null;
}

/**
 * Detect format from file extension.
 */
export function detectFormatFromExtension(filename: string): InputFormat | null {
  if (!filename) return null;
  const parts = filename.toLowerCase().split('.');
  if (parts.length < 2) return null;
  const ext = parts.pop();
  if (!ext) return null;

  const formatMap: Record<string, InputFormat> = {
    jpg: 'jpg',
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
    avif: 'avif',
    heic: 'heic',
    heif: 'heif',
  };

  return formatMap[ext] ?? null;
}

/**
 * Detect format from MIME type.
 */
export function detectFormatFromMime(mimeType: string): InputFormat | null {
  if (!mimeType) return null;
  const cleanMime = mimeType.toLowerCase().split(';')[0].trim();
  return MIME_FORMAT_MAP[cleanMime] ?? null;
}

/**
 * Robust format detection combining magic bytes, MIME, and extension.
 * Returns null if format cannot be verified — NEVER defaults unknown to jpg.
 */
export async function detectFormat(file: File): Promise<InputFormat | null> {
  // 1. Try magic bytes (most reliable)
  try {
    const slice = file.slice(0, 64);
    const headerBuffer = await slice.arrayBuffer();
    const fromBytes = detectFormatFromBytes(headerBuffer);
    if (fromBytes) return fromBytes;
  } catch {
    // continue to fallbacks if reading slice failed
  }

  // 2. Try MIME type
  if (file.type) {
    const fromMime = detectFormatFromMime(file.type);
    if (fromMime) return fromMime;
  }

  // 3. Fallback to extension
  return detectFormatFromExtension(file.name);
}

/**
 * Check whether a file extension is in our accepted list.
 */
export function hasAcceptedExtension(filename: string): boolean {
  if (!filename) return false;
  const ext = '.' + filename.toLowerCase().split('.').pop();
  return ACCEPTED_EXTENSIONS.includes(ext as typeof ACCEPTED_EXTENSIONS[number]);
}

/**
 * Single source of truth for file validation.
 * Enforces file sanity, size, format, dimension, and pixel limits consistently.
 */
export async function validateFile(file: File): Promise<ValidationResult> {
  // 1. Basic file sanity
  if (!file) {
    return {
      valid: false,
      fileSize: 0,
      error: createConversionError('INVALID_FILE'),
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      fileSize: 0,
      error: createConversionError('INVALID_FILE', {
        message: 'Selected file is empty (0 bytes).',
        userMessage: 'The selected file is empty or unreadable.',
      }),
    };
  }

  // 2. Size check
  if (file.size > IMAGE_LIMITS.maxFileSizeBytes) {
    return {
      valid: false,
      fileSize: file.size,
      error: createConversionError('FILE_TOO_LARGE'),
    };
  }

  // 3. Format detection
  const format = await detectFormat(file);
  if (!format) {
    return {
      valid: false,
      fileSize: file.size,
      error: createConversionError('UNSUPPORTED_FORMAT'),
    };
  }

  // 4. For HEIC/HEIF, dimension inspection is deferred until specialized decode
  if (format === 'heic' || format === 'heif') {
    return {
      valid: true,
      format,
      fileSize: file.size,
    };
  }

  // 5. Dimension & pixel safety check using browser decoder
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(file);
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close();

      if (width * height > IMAGE_LIMITS.maxPixels) {
        return {
          valid: false,
          format,
          width,
          height,
          fileSize: file.size,
          error: createConversionError('IMAGE_TOO_LARGE', {
            message: `Pixel count (${width}x${height} = ${width * height}) exceeds limit of ${IMAGE_LIMITS.maxPixels}.`,
          }),
        };
      }

      if (width > IMAGE_LIMITS.maxDimension || height > IMAGE_LIMITS.maxDimension) {
        return {
          valid: false,
          format,
          width,
          height,
          fileSize: file.size,
          error: createConversionError('IMAGE_TOO_LARGE', {
            message: `Dimension exceeds single-side limit of ${IMAGE_LIMITS.maxDimension}px.`,
          }),
        };
      }

      return {
        valid: true,
        format,
        width,
        height,
        fileSize: file.size,
      };
    } catch {
      return {
        valid: false,
        format,
        fileSize: file.size,
        error: createConversionError('DECODE_FAILED', {
          message: 'Browser failed to decode image bitmap.',
        }),
      };
    }
  }

  return {
    valid: true,
    format,
    fileSize: file.size,
  };
}

/**
 * Shared resize calculation engine.
 * Supports presets (25%, 50%, 75%), explicit dimensions, aspect ratio locking,
 * and guards against zero, negative, NaN, or absurd values.
 */
export function calculateResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  options: {
    width?: number;
    height?: number;
    preset?: ResizePreset;
    maintainAspectRatio?: boolean;
  },
): { width: number; height: number } {
  const origW = Math.max(1, Math.round(originalWidth || 1));
  const origH = Math.max(1, Math.round(originalHeight || 1));

  // Preset percentage scaling
  if (options.preset && options.preset !== 'original' && options.preset !== 'custom') {
    const scale = Number(options.preset) / 100;
    if (!isNaN(scale) && scale > 0) {
      return {
        width: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, Math.round(origW * scale))),
        height: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, Math.round(origH * scale))),
      };
    }
  }

  // No custom width or height requested -> original dimensions
  if (!options.width && !options.height) {
    return { width: origW, height: origH };
  }

  const aspectRatio = origW / origH;
  const maintainAspect = options.maintainAspectRatio !== false;

  let targetW = options.width ? Math.round(options.width) : undefined;
  let targetH = options.height ? Math.round(options.height) : undefined;

  if (targetW !== undefined && (isNaN(targetW) || targetW <= 0)) targetW = undefined;
  if (targetH !== undefined && (isNaN(targetH) || targetH <= 0)) targetH = undefined;

  if (maintainAspect) {
    if (targetW && !targetH) {
      return {
        width: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, targetW)),
        height: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, Math.round(targetW / aspectRatio))),
      };
    }
    if (targetH && !targetW) {
      return {
        width: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, Math.round(targetH * aspectRatio))),
        height: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, targetH)),
      };
    }
    if (targetW && targetH) {
      // Fit within bounding box
      const scaleW = targetW / origW;
      const scaleH = targetH / origH;
      const scale = Math.min(scaleW, scaleH);
      return {
        width: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, Math.round(origW * scale))),
        height: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, Math.round(origH * scale))),
      };
    }
  }

  return {
    width: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, targetW ?? origW)),
    height: Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, targetH ?? origH)),
  };
}

/**
 * Generate a clean, sanitized output filename.
 */
export function generateOutputFilename(
  originalName: string,
  outputFormat: OutputFormat | string,
  width?: number,
  height?: number,
): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const sanitized = baseName.replace(/[^a-zA-Z0-9_\-. ]/g, '').trim() || 'image';
  const ext = outputFormat === 'jpg' ? '.jpg' : FORMAT_EXTENSIONS[outputFormat as OutputFormat] || `.${outputFormat}`;

  if (width && height) {
    return `${sanitized}-${width}x${height}${ext}`;
  }

  return `${sanitized}${ext}`;
}

/**
 * Format file size in human-readable form.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

/**
 * Calculate size savings percentage.
 * Correctly distinguishes reductions from expansions without hiding negative change.
 */
export function calculateSavings(
  originalSize: number,
  outputSize: number,
): {
  percentage: number;
  isSmaller: boolean;
  isIdentical: boolean;
  differenceBytes: number;
} {
  if (originalSize <= 0) {
    return { percentage: 0, isSmaller: false, isIdentical: true, differenceBytes: 0 };
  }

  const diff = originalSize - outputSize;
  const percentage = Math.round(Math.abs((diff / originalSize) * 100));

  return {
    percentage,
    isSmaller: outputSize < originalSize,
    isIdentical: outputSize === originalSize,
    differenceBytes: Math.abs(diff),
  };
}
