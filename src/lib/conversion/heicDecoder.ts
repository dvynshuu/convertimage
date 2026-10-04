/**
 * Resilient Multi-Tier HEIC/HEIF Decoding Engine
 *
 * Implements a prioritized decoding pipeline for HEIC/HEIF images:
 * - Tier 1: Native browser decode (Hardware accelerated on Safari/WebKit/macOS/iOS)
 * - Tier 2: Modern WebAssembly Decoder (`heic-to` powered by libheif 1.23.5 & libde265 1.0.16)
 *           Supports iOS 16/17/18 HDR HEIC, HEVC Main 10 profile, Live Photos, and modern containers
 * - Tier 3: Modern WebAssembly Decoder with JPEG intermediary fallback
 * - Tier 4: Legacy `heic2any` decoder in memory-safe JPEG mode (single image, avoid PNG heap bloat)
 * - Tier 5: Legacy `heic2any` decoder in PNG mode
 */

import { createConversionError } from '../errors';

export interface HeicDecodeOptions {
  onProgress?: (progress: number) => void;
  abortSignal?: AbortSignal;
}

/**
 * Decodes a HEIC or HEIF file into an ImageBitmap using a multi-tier fallback pipeline.
 */
export async function decodeHeicToBitmap(
  file: File | Blob,
  options: HeicDecodeOptions = {},
): Promise<ImageBitmap> {
  const { onProgress, abortSignal } = options;

  if (abortSignal?.aborted) {
    throw createConversionError('CANCELLED');
  }

  const errors: Array<{ tier: string; error: unknown }> = [];

  // =========================================================================
  // Tier 1: Native Hardware / Browser Fast-Path (Safari, macOS, iOS WebKit)
  // =========================================================================
  try {
    onProgress?.(0.08);
    const nativeBitmap = await createImageBitmap(file);
    onProgress?.(0.35);
    return nativeBitmap;
  } catch (nativeErr) {
    // Expected in Chromium / Firefox where native HEIC is unsupported
    errors.push({ tier: 'Tier 1 (Native)', error: nativeErr });
  }

  if (abortSignal?.aborted) throw createConversionError('CANCELLED');
  onProgress?.(0.12);

  // =========================================================================
  // Tier 2: Modern WASM Decoder (`heic-to` - libheif 1.23.5 & libde265 1.0.16)
  // Direct to ImageBitmap
  // =========================================================================
  try {
    const heicToModule = await import('heic-to');
    const heicTo = heicToModule.heicTo || (heicToModule as unknown as { default: { heicTo: typeof heicToModule.heicTo } }).default?.heicTo;

    if (typeof heicTo === 'function') {
      if (abortSignal?.aborted) throw createConversionError('CANCELLED');
      onProgress?.(0.18);

      const bitmap = await heicTo({
        blob: file,
        type: 'bitmap',
      });

      if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
        onProgress?.(0.35);
        return bitmap;
      }
    }
  } catch (tier2Err) {
    console.warn('[HEIC Decoder] Tier 2 (heic-to bitmap) failed, trying Tier 3...', tier2Err);
    errors.push({ tier: 'Tier 2 (heic-to bitmap)', error: tier2Err });
  }

  if (abortSignal?.aborted) throw createConversionError('CANCELLED');
  onProgress?.(0.22);

  // =========================================================================
  // Tier 3: Modern WASM Decoder (`heic-to`) via JPEG Intermediary
  // =========================================================================
  try {
    const heicToModule = await import('heic-to');
    const heicTo = heicToModule.heicTo || (heicToModule as unknown as { default: { heicTo: typeof heicToModule.heicTo } }).default?.heicTo;

    if (typeof heicTo === 'function') {
      if (abortSignal?.aborted) throw createConversionError('CANCELLED');

      const jpegBlob = await heicTo({
        blob: file,
        type: 'image/jpeg',
        quality: 0.95,
      });

      if (abortSignal?.aborted) throw createConversionError('CANCELLED');
      if (jpegBlob && jpegBlob.size > 0) {
        const bitmap = await createImageBitmap(jpegBlob);
        onProgress?.(0.35);
        return bitmap;
      }
    }
  } catch (tier3Err) {
    console.warn('[HEIC Decoder] Tier 3 (heic-to jpeg) failed, trying Tier 4...', tier3Err);
    errors.push({ tier: 'Tier 3 (heic-to jpeg)', error: tier3Err });
  }

  if (abortSignal?.aborted) throw createConversionError('CANCELLED');
  onProgress?.(0.25);

  // =========================================================================
  // Tier 4: Legacy `heic2any` Decoder with JPEG (Memory-Safe, Single Image)
  // =========================================================================
  try {
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;

    if (typeof heic2any === 'function') {
      if (abortSignal?.aborted) throw createConversionError('CANCELLED');

      // Ensure input is passed cleanly
      const cleanBlob = file;

      // Request JPEG output instead of PNG to avoid Emscripten 32-bit canvas memory overflow
      const converted = await (heic2any as (opts: unknown) => Promise<Blob | Blob[]>)({
        blob: cleanBlob,
        toType: 'image/jpeg',
        quality: 0.95,
        multiple: false,
      });

      if (abortSignal?.aborted) throw createConversionError('CANCELLED');

      const resultBlob = Array.isArray(converted) ? converted[0] : converted;
      if (resultBlob && resultBlob.size > 0) {
        const bitmap = await createImageBitmap(resultBlob);
        onProgress?.(0.35);
        return bitmap;
      }
    }
  } catch (tier4Err) {
    console.warn('[HEIC Decoder] Tier 4 (heic2any jpeg) failed, trying Tier 5...', tier4Err);
    errors.push({ tier: 'Tier 4 (heic2any jpeg)', error: tier4Err });
  }

  if (abortSignal?.aborted) throw createConversionError('CANCELLED');
  onProgress?.(0.3);

  // =========================================================================
  // Tier 5: Legacy `heic2any` Decoder with PNG Output
  // =========================================================================
  try {
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;

    if (typeof heic2any === 'function') {
      if (abortSignal?.aborted) throw createConversionError('CANCELLED');

      const cleanBlob = file;

      const converted = await (heic2any as (opts: unknown) => Promise<Blob | Blob[]>)({
        blob: cleanBlob,
        toType: 'image/png',
        quality: 1,
      });

      if (abortSignal?.aborted) throw createConversionError('CANCELLED');

      const resultBlob = Array.isArray(converted) ? converted[0] : converted;
      if (resultBlob && resultBlob.size > 0) {
        const bitmap = await createImageBitmap(resultBlob);
        onProgress?.(0.35);
        return bitmap;
      }
    }
  } catch (tier5Err) {
    console.error('[HEIC Decoder] All decoding tiers failed for HEIC file:', errors, tier5Err);
    errors.push({ tier: 'Tier 5 (heic2any png)', error: tier5Err });
  }

  if (abortSignal?.aborted) throw createConversionError('CANCELLED');

  // If every tier exhausted without success, surface clear and actionable error
  const lastErrorMsg = errors
    .map((e) => `${e.tier}: ${e.error instanceof Error ? e.error.message : String(e.error)}`)
    .join('; ');

  throw createConversionError('DECODE_FAILED', {
    message: `HEIC decoding pipeline exhausted: ${lastErrorMsg}`,
    userMessage: "Couldn't decode this HEIC file.",
    recoveryAction:
      'The file might be damaged or use an unsupported Apple HDR RAW format. Try taking the photo in Most Compatible (JPEG) mode or exporting as JPEG from Photos.',
  });
}
