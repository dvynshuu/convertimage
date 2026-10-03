/// <reference lib="webworker" />

import type { WorkerRequest, WorkerResponse } from '../types';
import { FORMAT_MIME_MAP } from '../types';
import { IMAGE_LIMITS } from '../constants';

/* ─── Persistent Reusable Web Worker for Off-Thread Image Conversion ─── */

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const data = event.data;

  if (!data || data.type !== 'convert') {
    return;
  }

  const {
    jobId,
    buffer,
    inputFormat,
    outputFormat,
    quality,
    width: targetWidth,
    height: targetHeight,
    maintainAspectRatio,
  } = data;

  const startTime = performance.now();

  try {
    self.postMessage({ type: 'progress', jobId, progress: 0.1 } as WorkerResponse);

    // 1. Decode using createImageBitmap (hardware-accelerated in worker)
    const mime = FORMAT_MIME_MAP[inputFormat] || 'image/jpeg';
    const blob = new Blob([buffer], { type: mime });

    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(blob);
    } catch (decodeErr) {
      const msg = decodeErr instanceof Error ? decodeErr.message : 'Decode failed';
      self.postMessage({
        type: 'error',
        jobId,
        error: `Failed to decode ${inputFormat.toUpperCase()} image: ${msg}`,
        errorCode: 'DECODE_FAILED',
      } as WorkerResponse);
      return;
    }

    self.postMessage({ type: 'progress', jobId, progress: 0.4 } as WorkerResponse);

    const origWidth = bitmap.width;
    const origHeight = bitmap.height;

    // 2. Calculate target dimensions
    let finalWidth = targetWidth || origWidth;
    let finalHeight = targetHeight || origHeight;

    const maintainAspect = maintainAspectRatio !== false;
    if (maintainAspect && origWidth > 0 && origHeight > 0) {
      if (targetWidth && !targetHeight) {
        finalHeight = Math.round((targetWidth / origWidth) * origHeight);
      } else if (targetHeight && !targetWidth) {
        finalWidth = Math.round((targetHeight / origHeight) * origWidth);
      } else if (targetWidth && targetHeight) {
        const sourceRatio = origWidth / origHeight;
        const targetRatio = targetWidth / targetHeight;
        if (targetRatio > sourceRatio) {
          finalWidth = Math.round(targetHeight * sourceRatio);
        } else {
          finalHeight = Math.round(targetWidth / sourceRatio);
        }
      }
    }

    finalWidth = Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, finalWidth));
    finalHeight = Math.max(1, Math.min(IMAGE_LIMITS.maxDimension, finalHeight));

    // Check pixel safety limits
    if (finalWidth * finalHeight > IMAGE_LIMITS.maxPixels) {
      bitmap.close();
      self.postMessage({
        type: 'error',
        jobId,
        error: `Target image dimensions (${finalWidth}x${finalHeight}) exceed safe limit.`,
        errorCode: 'IMAGE_TOO_LARGE',
      } as WorkerResponse);
      return;
    }

    // 3. Render into OffscreenCanvas
    let canvas: OffscreenCanvas;
    try {
      canvas = new OffscreenCanvas(finalWidth, finalHeight);
    } catch {
      bitmap.close();
      self.postMessage({
        type: 'error',
        jobId,
        error: 'OffscreenCanvas allocation failed.',
        errorCode: 'MEMORY_LIMIT',
      } as WorkerResponse);
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      bitmap.close();
      self.postMessage({
        type: 'error',
        jobId,
        error: 'Failed to acquire OffscreenCanvas 2D context',
        errorCode: 'WORKER_ERROR',
      } as WorkerResponse);
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Shared pixel behavior: Fill with pure white for JPG to properly handle transparent sources
    if (outputFormat === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalWidth, finalHeight);
    }

    ctx.drawImage(bitmap, 0, 0, finalWidth, finalHeight);
    bitmap.close();

    self.postMessage({ type: 'progress', jobId, progress: 0.7 } as WorkerResponse);

    // 4. Encode to target format
    const outMime = FORMAT_MIME_MAP[outputFormat] || 'image/jpeg';
    const encodeQuality = outputFormat === 'png' ? undefined : quality;

    let outputBlob: Blob;
    try {
      outputBlob = await canvas.convertToBlob({
        type: outMime,
        quality: encodeQuality,
      });
    } catch (encodeErr) {
      const msg = encodeErr instanceof Error ? encodeErr.message : 'Encoding failed';
      self.postMessage({
        type: 'error',
        jobId,
        error: `Browser failed to encode image into ${outputFormat.toUpperCase()}: ${msg}`,
        errorCode: 'ENCODE_FAILED',
      } as WorkerResponse);
      return;
    }

    self.postMessage({ type: 'progress', jobId, progress: 0.9 } as WorkerResponse);

    const outputBuffer = await outputBlob.arrayBuffer();
    const durationMs = Math.round(performance.now() - startTime);

    // Transferable buffer for zero-copy postMessage
    const response: WorkerResponse = {
      type: 'success',
      jobId,
      buffer: outputBuffer,
      mimeType: outMime,
      width: finalWidth,
      height: finalHeight,
      durationMs,
    };

    self.postMessage(response, [outputBuffer]);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown worker conversion failure';
    self.postMessage({
      type: 'error',
      jobId,
      error: errorMsg,
      errorCode: 'WORKER_ERROR',
    } as WorkerResponse);
  }
};
