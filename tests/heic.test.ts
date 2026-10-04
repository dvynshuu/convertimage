import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { detectFormatFromBytes, validateFile } from '@/lib/formats';
import { decodeHeicToBitmap } from '@/lib/conversion/heicDecoder';

describe('HEIC Engine & Detection', () => {
  it('detects HEIC/HEIF format from real sample.heic file header', () => {
    const samplePath = path.join(process.cwd(), 'tests', 'sample.heic');
    if (fs.existsSync(samplePath)) {
      const buffer = fs.readFileSync(samplePath);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      const detected = detectFormatFromBytes(arrayBuffer);
      assert.ok(detected === 'heic' || detected === 'heif');
    }
  });

  it('validates a real HEIC file successfully', async () => {
    const samplePath = path.join(process.cwd(), 'tests', 'sample.heic');
    if (fs.existsSync(samplePath)) {
      const buffer = fs.readFileSync(samplePath);
      const file = new File([buffer], 'sample.heic', { type: 'image/heic' });
      const validation = await validateFile(file);
      assert.equal(validation.valid, true);
      assert.ok(validation.format === 'heic' || validation.format === 'heif');
      assert.ok(validation.fileSize > 0);
    }
  });

  it('immediately cancels HEIC decoding when abortSignal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const dummyBlob = new Blob([new Uint8Array([0, 1, 2, 3])], { type: 'image/heic' });
    await assert.rejects(
      async () => {
        await decodeHeicToBitmap(dummyBlob, { abortSignal: controller.signal });
      },
      {
        code: 'CANCELLED',
      },
    );
  });
});
