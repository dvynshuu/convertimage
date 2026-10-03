/// <reference lib="webworker" />

import type { WorkerRequest, WorkerResponse } from '../types';
import { FORMAT_MIME_MAP } from '../types';

/* ─── Web Worker for Off-Thread Image Conversion ─── */

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const data = event.data;

  if (data.type === 'cancel') {
    // Handled by worker termination in pool
    return;
  }

  if (data.type !== 'convert') {
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
    const blob = new Blob([buffer], { type: FORMAT_MIME_MAP[inputFormat] || 'image/jpeg' });
    let bitmap: ImageBitmap;

    try {
      bitmap = await createImageBitmap(blob);
    } catch {
      throw new Error(`Failed to decode ${inputFormat.toUpperCase()} image`);
    }

    self.postMessage({ type: 'progress', jobId, progress: 0.4 } as WorkerResponse);

    const origWidth = bitmap.width;
    const origHeight = bitmap.height;

    // 2. Calculate target dimensions
    let finalWidth = targetWidth || origWidth;
    let finalHeight = targetHeight || origHeight;

    if (maintainAspectRatio && origWidth > 0 && origHeight > 0) {
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

    finalWidth = Math.max(1, finalWidth);
    finalHeight = Math.max(1, finalHeight);

    // 3. Render into OffscreenCanvas
    const canvas = new OffscreenCanvas(finalWidth, finalHeight);
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      bitmap.close();
      throw new Error('Failed to acquire OffscreenCanvas 2D context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // White background for JPG if transparency could be present
    if (outputFormat === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalWidth, finalHeight);
    }

    ctx.drawImage(bitmap, 0, 0, finalWidth, finalHeight);
    bitmap.close();

    self.postMessage({ type: 'progress', jobId, progress: 0.7 } as WorkerResponse);

    // 4. Encode to target format
    const mimeType = FORMAT_MIME_MAP[outputFormat] || 'image/jpeg';
    const encodeQuality = outputFormat === 'png' ? undefined : quality;

    let outputBlob: Blob;
    try {
      outputBlob = await canvas.convertToBlob({
        type: mimeType,
        quality: encodeQuality,
      });
    } catch {
      throw new Error(`Browser failed to encode image into ${outputFormat.toUpperCase()}`);
    }

    self.postMessage({ type: 'progress', jobId, progress: 0.9 } as WorkerResponse);

    const outputBuffer = await outputBlob.arrayBuffer();
    const durationMs = Math.round(performance.now() - startTime);

    // Post success with transferable buffer for zero-copy performance
    const response: WorkerResponse = {
      type: 'success',
      jobId,
      buffer: outputBuffer,
      mimeType,
      width: finalWidth,
      height: finalHeight,
      durationMs,
    };

    self.postMessage(response, [outputBuffer]);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown worker conversion failure';
    const response: WorkerResponse = {
      type: 'error',
      jobId,
      error: errorMsg,
      errorType: 'worker_failure',
    };
    self.postMessage(response);
  }
};
