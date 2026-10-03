import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isJpeg,
  extractExifFromJpeg,
  injectExifIntoJpeg,
  sanitizeGpsFromExif,
} from '../src/lib/conversion/exif';

describe('EXIF Engine', () => {
  it('identifies JPEG buffers by SOI marker', () => {
    const valid = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const invalid = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    assert.equal(isJpeg(valid.buffer), true);
    assert.equal(isJpeg(invalid.buffer), false);
  });

  it('returns null when no APP1 EXIF segment is present', () => {
    // SOI + APP0 (JFIF) + EOI
    const noExifJpeg = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xe0, 0x00, 0x04, 0x01, 0x02,
      0xff, 0xd9,
    ]);
    const extracted = extractExifFromJpeg(noExifJpeg.buffer);
    assert.equal(extracted, null);
  });

  it('extracts APP1 EXIF segment when present', () => {
    // SOI + APP1 (Exif) + EOI
    const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"
    const payload = [0x49, 0x49, 0x2a, 0x00]; // sample TIFF data
    const segmentLen = 2 + exifHeader.length + payload.length; // length includes the 2 length bytes
    const exifJpeg = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xe1, (segmentLen >> 8) & 0xff, segmentLen & 0xff,
      ...exifHeader,
      ...payload,
      0xff, 0xd9,
    ]);

    const extracted = extractExifFromJpeg(exifJpeg.buffer);
    assert.notEqual(extracted, null);
    assert.equal(extracted![0], 0xff);
    assert.equal(extracted![1], 0xe1);
    assert.equal(extracted![4], 0x45); // 'E'
    assert.equal(extracted![5], 0x78); // 'x'
  });

  it('injects EXIF segment into a JPEG lacking EXIF', () => {
    // Clean JPEG: SOI + APP0 + EOI
    const target = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xe0, 0x00, 0x04, 0xaa, 0xbb,
      0xff, 0xd9,
    ]);

    const sampleExif = new Uint8Array([
      0xff, 0xe1, 0x00, 0x0a,
      0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
      0x01, 0x02,
    ]);

    const injectedBuffer = injectExifIntoJpeg(target.buffer, sampleExif);
    const injected = new Uint8Array(injectedBuffer);

    // Verifies the injected buffer starts with SOI
    assert.equal(injected[0], 0xff);
    assert.equal(injected[1], 0xd8);

    // And now extractExifFromJpeg can retrieve the injected segment
    const roundtrip = extractExifFromJpeg(injectedBuffer);
    assert.notEqual(roundtrip, null);
    assert.equal(roundtrip!.length, sampleExif.length);
  });

  it('handles GPS sanitization without error on truncated or minimal segments', () => {
    const raw = new Uint8Array([0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
    const sanitized = sanitizeGpsFromExif(raw);
    assert.equal(sanitized.length, raw.length);
  });
});
