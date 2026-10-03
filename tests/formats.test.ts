import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatFileSize,
  calculateSavings,
  generateOutputFilename,
  detectFormatFromExtension,
  detectFormatFromMime,
  detectFormatFromBytes,
} from '@/lib/formats';

describe('formatFileSize', () => {
  it('formats 0 bytes correctly', () => {
    assert.equal(formatFileSize(0), '0 B');
  });

  it('formats bytes, kilobytes, and megabytes', () => {
    assert.equal(formatFileSize(500), '500 B');
    assert.equal(formatFileSize(1024), '1.0 KB');
    assert.equal(formatFileSize(1024 * 1024), '1.0 MB');
    assert.equal(formatFileSize(2.4 * 1024 * 1024), '2.4 MB');
    assert.equal(formatFileSize(15 * 1024 * 1024), '15 MB');
  });
});

describe('calculateSavings', () => {
  it('calculates file reduction percentage correctly', () => {
    const result = calculateSavings(1000, 400);
    assert.equal(result.percentage, 60);
    assert.equal(result.isSmaller, true);
  });

  it('calculates file expansion percentage correctly', () => {
    const result = calculateSavings(1000, 1250);
    assert.equal(result.percentage, 25);
    assert.equal(result.isSmaller, false);
  });

  it('handles identical file sizes', () => {
    const result = calculateSavings(500, 500);
    assert.equal(result.percentage, 0);
    assert.equal(result.isSmaller, false);
  });
});

describe('generateOutputFilename', () => {
  it('replaces extension with target format', () => {
    assert.equal(generateOutputFilename('photo.jpg', 'webp'), 'photo.webp');
    assert.equal(generateOutputFilename('graphic.png', 'avif'), 'graphic.avif');
  });

  it('appends dimensions when specified', () => {
    assert.equal(
      generateOutputFilename('banner.jpg', 'png', 1920, 1080),
      'banner-1920x1080.png',
    );
  });

  it('sanitizes unsafe characters in filename', () => {
    assert.equal(
      generateOutputFilename('my <cool> photo*?.heic', 'jpg'),
      'my cool photo.jpg',
    );
  });
});

describe('detectFormatFromExtension', () => {
  it('identifies standard extensions', () => {
    assert.equal(detectFormatFromExtension('IMAGE.JPG'), 'jpg');
    assert.equal(detectFormatFromExtension('image.jpeg'), 'jpg');
    assert.equal(detectFormatFromExtension('logo.png'), 'png');
    assert.equal(detectFormatFromExtension('graphic.webp'), 'webp');
    assert.equal(detectFormatFromExtension('modern.avif'), 'avif');
    assert.equal(detectFormatFromExtension('photo.heic'), 'heic');
    assert.equal(detectFormatFromExtension('photo.heif'), 'heif');
  });

  it('returns null for unsupported extensions', () => {
    assert.equal(detectFormatFromExtension('document.pdf'), null);
    assert.equal(detectFormatFromExtension('archive.zip'), null);
    assert.equal(detectFormatFromExtension('vector.svg'), null);
  });
});

describe('detectFormatFromMime', () => {
  it('identifies valid MIME types', () => {
    assert.equal(detectFormatFromMime('image/jpeg'), 'jpg');
    assert.equal(detectFormatFromMime('image/png'), 'png');
    assert.equal(detectFormatFromMime('image/webp'), 'webp');
    assert.equal(detectFormatFromMime('image/avif'), 'avif');
    assert.equal(detectFormatFromMime('image/heic'), 'heic');
    assert.equal(detectFormatFromMime('image/heif'), 'heif');
  });

  it('returns null for unknown MIME types', () => {
    assert.equal(detectFormatFromMime('application/json'), null);
    assert.equal(detectFormatFromMime('text/html'), null);
  });
});

describe('detectFormatFromBytes', () => {
  it('detects JPEG from SOI marker', () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).buffer;
    assert.equal(detectFormatFromBytes(buffer), 'jpg');
  });

  it('detects PNG from signature', () => {
    const buffer = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
    ]).buffer;
    assert.equal(detectFormatFromBytes(buffer), 'png');
  });

  it('detects WebP from RIFF and WEBP markers', () => {
    // 0-3: "RIFF", 4-7: length, 8-11: "WEBP"
    const bytes = new Uint8Array(16);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
    bytes.set([0x00, 0x00, 0x00, 0x00], 4);
    bytes.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
    assert.equal(detectFormatFromBytes(bytes.buffer), 'webp');
  });

  it('detects AVIF from ftyp and avif brand', () => {
    // 4-7: "ftyp", 8-11: "avif"
    const bytes = new Uint8Array(16);
    bytes.set([0x00, 0x00, 0x00, 0x1c], 0);
    bytes.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
    bytes.set([0x61, 0x76, 0x69, 0x66], 8); // avif
    assert.equal(detectFormatFromBytes(bytes.buffer), 'avif');
  });

  it('detects HEIC from ftyp and heic brand', () => {
    const bytes = new Uint8Array(16);
    bytes.set([0x00, 0x00, 0x00, 0x1c], 0);
    bytes.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
    bytes.set([0x68, 0x65, 0x69, 0x63], 8); // heic
    assert.equal(detectFormatFromBytes(bytes.buffer), 'heic');
  });

  it('returns null for unknown byte streams', () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    assert.equal(detectFormatFromBytes(bytes.buffer), null);
  });
});
