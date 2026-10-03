import type { InputFormat, ValidationResult, ConversionError } from './types';
import { MIME_FORMAT_MAP } from './types';
import { IMAGE_LIMITS, ACCEPTED_EXTENSIONS } from './constants';

/**
 * Detect format from magic bytes (file header).
 * More reliable than MIME type or extension alone.
 */
export function detectFormatFromBytes(buffer: ArrayBuffer): InputFormat | null {
  const view = new Uint8Array(buffer.slice(0, 12));

  // JPEG: FF D8 FF
  if (view[0] === 0xFF && view[1] === 0xD8 && view[2] === 0xFF) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47
  if (view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47) {
    return 'png';
  }

  // WebP: RIFF....WEBP
  if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46 &&
      view[8] === 0x57 && view[9] === 0x45 && view[10] === 0x42 && view[11] === 0x50) {
    return 'webp';
  }

  // HEIC/HEIF/AVIF — all use ISO BMFF container with ftyp box
  // ftyp at bytes 4-7
  if (view[4] === 0x66 && view[5] === 0x74 && view[6] === 0x79 && view[7] === 0x70) {
    // Read the brand (bytes 8-11)
    const brand = String.fromCharCode(view[8], view[9], view[10], view[11]);

    if (brand === 'avif' || brand === 'avis') return 'avif';
    if (brand === 'heic' || brand === 'heix' || brand === 'heim' || brand === 'heis') return 'heic';
    if (brand === 'heif' || brand === 'hevx' || brand === 'mif1') return 'heif';
  }

  return null;
}

/**
 * Detect format from file extension.
 */
export function detectFormatFromExtension(filename: string): InputFormat | null {
  const ext = filename.toLowerCase().split('.').pop();
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
  return MIME_FORMAT_MAP[mimeType] ?? null;
}

/**
 * Best-effort format detection combining multiple signals.
 */
export async function detectFormat(file: File): Promise<InputFormat | null> {
  // 1. Try magic bytes (most reliable)
  const headerBuffer = await file.slice(0, 12).arrayBuffer();
  const fromBytes = detectFormatFromBytes(headerBuffer);
  if (fromBytes) return fromBytes;

  // 2. Try MIME type
  const fromMime = detectFormatFromMime(file.type);
  if (fromMime) return fromMime;

  // 3. Fallback to extension
  return detectFormatFromExtension(file.name);
}

/**
 * Check whether a file extension is in our accepted list.
 */
export function hasAcceptedExtension(filename: string): boolean {
  const ext = '.' + filename.toLowerCase().split('.').pop();
  return ACCEPTED_EXTENSIONS.includes(ext as typeof ACCEPTED_EXTENSIONS[number]);
}

/**
 * Validate a file before processing.
 */
export async function validateFile(file: File): Promise<ValidationResult> {
  // Check file size
  if (file.size > IMAGE_LIMITS.maxFileSizeBytes) {
    return {
      valid: false,
      fileSize: file.size,
      error: createValidationError('file_too_large'),
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      fileSize: 0,
      error: createValidationError('corrupted_file'),
    };
  }

  // Detect format
  const format = await detectFormat(file);
  if (!format) {
    return {
      valid: false,
      fileSize: file.size,
      error: createValidationError('unsupported_format'),
    };
  }

  // For HEIC/HEIF, we can't easily get dimensions without decoding.
  // We'll validate dimensions after decoding.
  if (format === 'heic' || format === 'heif') {
    return {
      valid: true,
      format,
      fileSize: file.size,
    };
  }

  // For standard web formats, try to decode and check dimensions
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
        error: createValidationError('dimensions_too_large'),
      };
    }

    if (width > IMAGE_LIMITS.maxDimension || height > IMAGE_LIMITS.maxDimension) {
      return {
        valid: false,
        format,
        width,
        height,
        fileSize: file.size,
        error: createValidationError('dimensions_too_large'),
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
      error: createValidationError('corrupted_file'),
    };
  }
}

/**
 * Generate a clean output filename.
 */
export function generateOutputFilename(
  originalName: string,
  outputFormat: string,
  width?: number,
  height?: number,
): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const sanitized = baseName.replace(/[^a-zA-Z0-9_\-. ]/g, '').trim() || 'image';

  if (width && height) {
    return `${sanitized}-${width}x${height}.${outputFormat === 'jpg' ? 'jpg' : outputFormat}`;
  }

  return `${sanitized}.${outputFormat === 'jpg' ? 'jpg' : outputFormat}`;
}

/**
 * Create standardized validation errors.
 */
function createValidationError(type: ConversionError['type']): ConversionError {
  switch (type) {
    case 'file_too_large':
      return {
        type: 'file_too_large',
        message: 'File exceeds maximum size limit',
        userMessage: 'This image is too large to process safely in your browser.',
        recoveryAction: `Please choose an image under ${IMAGE_LIMITS.maxFileSizeMB} MB.`,
      };
    case 'corrupted_file':
      return {
        type: 'corrupted_file',
        message: 'File is corrupted or empty',
        userMessage: 'This file appears to be corrupted or damaged.',
        recoveryAction: 'Try another file.',
      };
    case 'unsupported_format':
      return {
        type: 'unsupported_format',
        message: 'File format not supported',
        userMessage: 'This file format is not supported.',
        recoveryAction: 'Try JPG, PNG, WebP, AVIF, or HEIC.',
      };
    case 'dimensions_too_large':
      return {
        type: 'dimensions_too_large',
        message: 'Image dimensions exceed safe limit',
        userMessage: "This image's dimensions exceed the safe processing limit.",
        recoveryAction: 'Try a smaller image.',
      };
    default:
      return {
        type: 'unknown',
        message: 'Unknown validation error',
        userMessage: "We couldn't process this file.",
        recoveryAction: 'Try another file.',
      };
  }
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
 */
export function calculateSavings(originalSize: number, outputSize: number): {
  percentage: number;
  isSmaller: boolean;
} {
  const percentage = Math.abs(((originalSize - outputSize) / originalSize) * 100);
  return {
    percentage: Math.round(percentage),
    isSmaller: outputSize < originalSize,
  };
}
