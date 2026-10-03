import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isJpeg,
  extractExifFromJpeg,
  injectExifIntoJpeg,
  sanitizeGpsFromExif,
  normalizeOrientationInExif,
  readOrientationFromExif,
} from '../src/lib/conversion/exif';

describe('EXIF Engine', () => {
  it('identifies JPEG buffers by SOI marker', () => {
    const valid = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const invalid = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    assert.equal(isJpeg(valid.buffer), true);
    assert.equal(isJpeg(invalid.buffer), false);
  });

  it('returns null when no APP1 EXIF segment is present', () => {
    const noExifJpeg = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xe0, 0x00, 0x04, 0x01, 0x02,
      0xff, 0xd9,
    ]);
    const extracted = extractExifFromJpeg(noExifJpeg.buffer);
    assert.equal(extracted, null);
  });

  it('extracts APP1 EXIF segment when present', () => {
    const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"
    const payload = [0x49, 0x49, 0x2a, 0x00]; // sample TIFF data
    const segmentLen = 2 + exifHeader.length + payload.length;
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

    assert.equal(injected[0], 0xff);
    assert.equal(injected[1], 0xd8);

    const roundtrip = extractExifFromJpeg(injectedBuffer);
    assert.notEqual(roundtrip, null);
    assert.equal(roundtrip!.length, sampleExif.length);
  });

  it('handles GPS sanitization without error on truncated or minimal segments', () => {
    const raw = new Uint8Array([0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
    const sanitized = sanitizeGpsFromExif(raw);
    assert.equal(sanitized.length, raw.length);
  });

  it('correctly reads orientation and normalizes it to 1 to prevent double-rotation', () => {
    // Construct a valid TIFF APP1 EXIF segment with orientation 6 (90 CW / portrait photo from mobile)
    // Little-Endian ("II")
    const tiffHeader = [
      0x49, 0x49,             // Byte order: II
      0x2a, 0x00,             // 42
      0x08, 0x00, 0x00, 0x00, // Offset to IFD0 = 8
    ];

    const ifd0 = [
      0x01, 0x00,             // 1 entry
      0x12, 0x01,             // Tag 0x0112 (Orientation)
      0x03, 0x00,             // Type 3 (SHORT)
      0x01, 0x00, 0x00, 0x00, // Count = 1
      0x06, 0x00, 0x00, 0x00, // Value = 6 (90 deg CW)
      0x00, 0x00, 0x00, 0x00, // Next IFD offset = 0
    ];

    const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
    const payload = [...tiffHeader, ...ifd0];
    const segmentLength = 2 + exifHeader.length + payload.length;

    const segment = new Uint8Array([
      0xff, 0xe1,
      (segmentLength >> 8) & 0xff, segmentLength & 0xff,
      ...exifHeader,
      ...payload,
    ]);

    // Initial orientation must be 6
    assert.equal(readOrientationFromExif(segment), 6);

    // Normalize orientation
    const normalized = normalizeOrientationInExif(segment);

    // Orientation must now be 1
    assert.equal(readOrientationFromExif(normalized), 1);
  });

  it('normalizes orientations 1, 3, 8 to 1', () => {
    for (const testOrientation of [1, 3, 8]) {
      const tiffHeader = [
        0x49, 0x49,
        0x2a, 0x00,
        0x08, 0x00, 0x00, 0x00,
      ];
      const ifd0 = [
        0x01, 0x00,
        0x12, 0x01,
        0x03, 0x00,
        0x01, 0x00, 0x00, 0x00,
        testOrientation, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ];
      const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
      const payload = [...tiffHeader, ...ifd0];
      const segmentLength = 2 + exifHeader.length + payload.length;

      const segment = new Uint8Array([
        0xff, 0xe1,
        (segmentLength >> 8) & 0xff, segmentLength & 0xff,
        ...exifHeader,
        ...payload,
      ]);

      assert.equal(readOrientationFromExif(segment), testOrientation);
      const normalized = normalizeOrientationInExif(segment);
      assert.equal(readOrientationFromExif(normalized), 1);
    }
  });
});
