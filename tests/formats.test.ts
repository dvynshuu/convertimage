import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatFileSize,
  calculateSavings,
  generateOutputFilename,
  detectFormatFromExtension,
  detectFormatFromMime,
  detectFormatFromBytes,
  calculateResizeDimensions,
  validateFile,
} from '@/lib/formats';
import { IMAGE_LIMITS } from '@/lib/constants';

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
    assert.equal(result.isIdentical, false);
    assert.equal(result.differenceBytes, 600);
  });

  it('calculates file expansion percentage correctly without hiding increase', () => {
    const result = calculateSavings(1000, 1250);
    assert.equal(result.percentage, 25);
    assert.equal(result.isSmaller, false);
    assert.equal(result.isIdentical, false);
    assert.equal(result.differenceBytes, 250);
  });

  it('handles identical file sizes', () => {
    const result = calculateSavings(500, 500);
    assert.equal(result.percentage, 0);
    assert.equal(result.isSmaller, false);
    assert.equal(result.isIdentical, true);
    assert.equal(result.differenceBytes, 0);
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

  it('defaults to image when original name has only invalid characters', () => {
    assert.equal(generateOutputFilename('<>***.png', 'webp'), 'image.webp');
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
    assert.equal(detectFormatFromExtension('noextension'), null);
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

  it('handles MIME with charset or parameters', () => {
    assert.equal(detectFormatFromMime('image/jpeg; charset=utf-8'), 'jpg');
  });

  it('returns null for unknown MIME types', () => {
    assert.equal(detectFormatFromMime('application/json'), null);
    assert.equal(detectFormatFromMime('text/html'), null);
    assert.equal(detectFormatFromMime(''), null);
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
    const bytes = new Uint8Array(16);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
    bytes.set([0x00, 0x00, 0x00, 0x00], 4);
    bytes.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
    assert.equal(detectFormatFromBytes(bytes.buffer), 'webp');
  });

  it('detects AVIF from ftyp and avif brand', () => {
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

  it('detects HEIF from ftyp and mif1 brand', () => {
    const bytes = new Uint8Array(16);
    bytes.set([0x00, 0x00, 0x00, 0x1c], 0);
    bytes.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
    bytes.set([0x6d, 0x69, 0x66, 0x31], 8); // mif1
    assert.equal(detectFormatFromBytes(bytes.buffer), 'heif');
  });

  it('returns null for unknown byte streams', () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    assert.equal(detectFormatFromBytes(bytes.buffer), null);
  });
});

describe('calculateResizeDimensions', () => {
  it('returns original dimensions when no options are provided', () => {
    const dims = calculateResizeDimensions(1920, 1080, {});
    assert.equal(dims.width, 1920);
    assert.equal(dims.height, 1080);
  });

  it('calculates 50% preset dimensions accurately', () => {
    const dims = calculateResizeDimensions(1920, 1080, { preset: '50' });
    assert.equal(dims.width, 960);
    assert.equal(dims.height, 540);
  });

  it('calculates 25% and 75% preset dimensions accurately', () => {
    const dims25 = calculateResizeDimensions(1000, 800, { preset: '25' });
    assert.equal(dims25.width, 250);
    assert.equal(dims25.height, 200);

    const dims75 = calculateResizeDimensions(1000, 800, { preset: '75' });
    assert.equal(dims75.width, 750);
    assert.equal(dims75.height, 600);
  });

  it('scales height when only width is specified with aspect ratio locked', () => {
    const dims = calculateResizeDimensions(1000, 500, { width: 500, maintainAspectRatio: true });
    assert.equal(dims.width, 500);
    assert.equal(dims.height, 250);
  });

  it('scales width when only height is specified with aspect ratio locked', () => {
    const dims = calculateResizeDimensions(1000, 500, { height: 250, maintainAspectRatio: true });
    assert.equal(dims.width, 500);
    assert.equal(dims.height, 250);
  });

  it('fits within bounding box when both width and height are given with aspect ratio locked', () => {
    // 1600x1200 (4:3) into 800x800 box -> 800x600
    const dims = calculateResizeDimensions(1600, 1200, {
      width: 800,
      height: 800,
      maintainAspectRatio: true,
    });
    assert.equal(dims.width, 800);
    assert.equal(dims.height, 600);
  });

  it('allows exact dimensions when maintainAspectRatio is false', () => {
    const dims = calculateResizeDimensions(1600, 1200, {
      width: 800,
      height: 800,
      maintainAspectRatio: false,
    });
    assert.equal(dims.width, 800);
    assert.equal(dims.height, 800);
  });

  it('clamps dimensions to safe limits', () => {
    const dims = calculateResizeDimensions(100, 100, {
      width: 999999,
      height: 999999,
      maintainAspectRatio: false,
    });
    assert.equal(dims.width, IMAGE_LIMITS.maxDimension);
    assert.equal(dims.height, IMAGE_LIMITS.maxDimension);
  });
});

describe('validateFile', () => {
  it('rejects empty file', async () => {
    const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const result = await validateFile(emptyFile);
    assert.equal(result.valid, false);
    assert.equal(result.error?.code, 'INVALID_FILE');
  });

  it('rejects file exceeding size limit', async () => {
    const bigFile = new File([new Uint8Array(26 * 1024 * 1024)], 'giant.jpg', {
      type: 'image/jpeg',
    });
    const result = await validateFile(bigFile);
    assert.equal(result.valid, false);
    assert.equal(result.error?.code, 'FILE_TOO_LARGE');
  });

  it('rejects unsupported file type', async () => {
    const txtFile = new File(['hello world'], 'notes.txt', { type: 'text/plain' });
    const result = await validateFile(txtFile);
    assert.equal(result.valid, false);
    assert.equal(result.error?.code, 'UNSUPPORTED_FORMAT');
  });
});
