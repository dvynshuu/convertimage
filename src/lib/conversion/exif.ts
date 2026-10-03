/**
 * EXIF Metadata Extraction, Normalization, and Injection Engine
 *
 * Provides client-side binary parsing to preserve camera metadata
 * while normalizing orientation (to prevent double-rotation bugs)
 * and sanitizing GPS metadata when requested.
 */

/**
 * Check if buffer has a valid JPEG SOI marker (0xFF, 0xD8)
 */
export function isJpeg(buffer: ArrayBuffer | Uint8Array): boolean {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

/**
 * Extract the raw APP1 EXIF segment from a JPEG ArrayBuffer.
 * Returns the entire segment including marker 0xFFE1, 2-byte length, and data,
 * or null if no EXIF segment exists.
 */
export function extractExifFromJpeg(buffer: ArrayBuffer): Uint8Array | null {
  const data = new Uint8Array(buffer);
  if (!isJpeg(data)) return null;

  let offset = 2; // Skip SOI (0xFF, 0xD8)
  const length = data.length;

  while (offset + 4 < length) {
    if (data[offset] !== 0xff) {
      break; // Malformed JPEG marker
    }

    const marker = data[offset + 1];

    // Standalone markers without length: SOI (0xD8), EOI (0xD9), TEM (0x01), RST0-RST7 (0xD0-0xD7)
    if (marker === 0xd9 || marker === 0xda) {
      // EOI (End of image) or SOS (Start of scan) - header ends here
      break;
    }

    const segmentLength = (data[offset + 2] << 8) | data[offset + 3];
    if (segmentLength < 2 || offset + 2 + segmentLength > length) {
      break;
    }

    // APP1 marker is 0xE1
    if (marker === 0xe1) {
      // Check for Exif header: 'E', 'x', 'i', 'f', 0x00, 0x00
      if (
        offset + 10 <= length &&
        data[offset + 4] === 0x45 && // E
        data[offset + 5] === 0x78 && // x
        data[offset + 6] === 0x69 && // i
        data[offset + 7] === 0x66 && // f
        data[offset + 8] === 0x00 &&
        data[offset + 9] === 0x00
      ) {
        // Return full APP1 segment: marker (2 bytes) + length (2 bytes) + payload
        const fullLength = segmentLength + 2;
        return data.slice(offset, offset + fullLength);
      }
    }

    offset += 2 + segmentLength;
  }

  return null;
}

/**
 * Inject an APP1 EXIF segment into a newly encoded JPEG ArrayBuffer.
 * Places the EXIF APP1 segment immediately after SOI or existing APP0 marker.
 */
export function injectExifIntoJpeg(
  targetJpegBuffer: ArrayBuffer,
  exifSegment: Uint8Array,
): ArrayBuffer {
  const target = new Uint8Array(targetJpegBuffer);
  if (!isJpeg(target)) {
    return targetJpegBuffer; // Return unmodified if not JPEG
  }

  // Find insertion point: directly after SOI (offset 2) or after APP0 if present
  let insertOffset = 2;
  if (target.length >= 4 && target[2] === 0xff && target[3] === 0xe0) {
    // APP0 found; skip past it
    const app0Length = (target[4] << 8) | target[5];
    insertOffset = 2 + 2 + app0Length;
  }

  // Create combined buffer
  const result = new Uint8Array(target.length + exifSegment.length);

  // 1. Copy up to insert point
  result.set(target.subarray(0, insertOffset), 0);

  // 2. Insert EXIF APP1 segment
  result.set(exifSegment, insertOffset);

  // 3. Copy remainder of target JPEG
  result.set(target.subarray(insertOffset), insertOffset + exifSegment.length);

  return result.buffer;
}

/**
 * Read the current orientation tag from an EXIF segment.
 * Returns orientation number (1-8) or null if tag not present.
 */
export function readOrientationFromExif(exifSegment: Uint8Array): number | null {
  if (exifSegment.length < 18) return null;

  const tiffStart = 10;
  const isLittleEndian = exifSegment[tiffStart] === 0x49 && exifSegment[tiffStart + 1] === 0x49;
  const isBigEndian = exifSegment[tiffStart] === 0x4d && exifSegment[tiffStart + 1] === 0x4d;

  if (!isLittleEndian && !isBigEndian) return null;

  const view = new DataView(exifSegment.buffer, exifSegment.byteOffset, exifSegment.byteLength);
  const readU16 = (pos: number) => view.getUint16(pos, isLittleEndian);
  const readU32 = (pos: number) => view.getUint32(pos, isLittleEndian);

  const ifd0Offset = tiffStart + readU32(tiffStart + 4);
  if (ifd0Offset + 2 > exifSegment.length) return null;

  const numEntries = readU16(ifd0Offset);
  let entryPos = ifd0Offset + 2;

  for (let i = 0; i < numEntries; i++) {
    if (entryPos + 12 > exifSegment.length) break;

    const tag = readU16(entryPos);
    if (tag === 0x0112) {
      // Orientation tag found (Type 3 = SHORT, count 1, value at entryPos + 8)
      return readU16(entryPos + 8);
    }

    entryPos += 12;
  }

  return null;
}

/**
 * Normalize Orientation in EXIF to 1 (Normal / Top-Left).
 *
 * Why this is mandatory:
 * When browsers/workers decode images via createImageBitmap or canvas, the pixel
 * array is already oriented upright according to the source EXIF. If we inject
 * the original EXIF segment without resetting the Orientation tag to 1,
 * image viewers will rotate the upright image a second time (the double-rotation bug).
 */
export function normalizeOrientationInExif(exifSegment: Uint8Array): Uint8Array {
  const segment = new Uint8Array(exifSegment);
  if (segment.length < 18) return segment;

  const tiffStart = 10;
  const isLittleEndian = segment[tiffStart] === 0x49 && segment[tiffStart + 1] === 0x49;
  const isBigEndian = segment[tiffStart] === 0x4d && segment[tiffStart + 1] === 0x4d;

  if (!isLittleEndian && !isBigEndian) return segment;

  const view = new DataView(segment.buffer, segment.byteOffset, segment.byteLength);
  const readU16 = (pos: number) => view.getUint16(pos, isLittleEndian);
  const readU32 = (pos: number) => view.getUint32(pos, isLittleEndian);

  const ifd0Offset = tiffStart + readU32(tiffStart + 4);
  if (ifd0Offset + 2 > segment.length) return segment;

  const numEntries = readU16(ifd0Offset);
  let entryPos = ifd0Offset + 2;

  // Search for Tag 0x0112 (Orientation)
  for (let i = 0; i < numEntries; i++) {
    if (entryPos + 12 > segment.length) break;

    const tag = readU16(entryPos);
    if (tag === 0x0112) {
      // Set orientation value to 1 (normal)
      view.setUint16(entryPos + 8, 1, isLittleEndian);
      // Zero out upper 2 bytes of the 4-byte value field
      view.setUint16(entryPos + 10, 0, isLittleEndian);
      break;
    }

    entryPos += 12;
  }

  return segment;
}

/**
 * Strip GPS metadata from an EXIF segment while preserving camera settings & dates.
 * Searches for GPS IFD pointer (Tag 0x8825) in IFD0 and zeros it out.
 */
export function sanitizeGpsFromExif(exifSegment: Uint8Array): Uint8Array {
  const segment = new Uint8Array(exifSegment);
  if (segment.length < 18) return segment;

  const tiffStart = 10;
  const isLittleEndian = segment[tiffStart] === 0x49 && segment[tiffStart + 1] === 0x49;
  const isBigEndian = segment[tiffStart] === 0x4d && segment[tiffStart + 1] === 0x4d;

  if (!isLittleEndian && !isBigEndian) return segment;

  const view = new DataView(segment.buffer, segment.byteOffset, segment.byteLength);
  const readU16 = (pos: number) => view.getUint16(pos, isLittleEndian);
  const readU32 = (pos: number) => view.getUint32(pos, isLittleEndian);

  const ifd0Offset = tiffStart + readU32(tiffStart + 4);
  if (ifd0Offset + 2 > segment.length) return segment;

  const numEntries = readU16(ifd0Offset);
  let entryPos = ifd0Offset + 2;

  // Search for Tag 0x8825 (GPSInfo IFD)
  for (let i = 0; i < numEntries; i++) {
    if (entryPos + 12 > segment.length) break;

    const tag = readU16(entryPos);
    if (tag === 0x8825) {
      // Zero out the tag and its offset to remove GPS link
      view.setUint16(entryPos, 0x0000, isLittleEndian);
      view.setUint32(entryPos + 8, 0x00000000, isLittleEndian);
      break;
    }

    entryPos += 12;
  }

  return segment;
}

/**
 * Apply EXIF preservation policy to an output Blob.
 * Normalizes orientation to 1 to prevent double-rotation.
 * Sanitizes GPS when requested.
 */
export async function applyExifPolicy(
  outputBlob: Blob,
  sourceBuffer: ArrayBuffer,
  outputFormat: string,
  options: { preserveExif: boolean; stripGps?: boolean },
): Promise<Blob> {
  if (!options.preserveExif) {
    return outputBlob;
  }

  // Only JPEG currently supports direct lossless APP1 injection
  if (outputFormat !== 'jpg' && outputFormat !== 'jpeg') {
    return outputBlob;
  }

  let exifSegment = extractExifFromJpeg(sourceBuffer);
  if (!exifSegment) {
    return outputBlob;
  }

  // Always normalize orientation to 1 so already-rendered pixels aren't rotated again
  exifSegment = normalizeOrientationInExif(exifSegment);

  if (options.stripGps) {
    exifSegment = sanitizeGpsFromExif(exifSegment);
  }

  const outputArrayBuffer = await outputBlob.arrayBuffer();
  const withExifBuffer = injectExifIntoJpeg(outputArrayBuffer, exifSegment);

  return new Blob([withExifBuffer], { type: outputBlob.type || 'image/jpeg' });
}
