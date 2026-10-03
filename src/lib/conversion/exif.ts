/**
 * EXIF Metadata Extraction and Injection Engine
 * 
 * Provides client-side binary parsing to preserve or sanitize camera & GPS metadata
 * without requiring external native dependencies.
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
 * Strip GPS metadata from an EXIF segment while preserving camera settings & dates.
 * Searches for GPS IFD pointer (Tag 0x8825) in IFD0 and zeros it out.
 */
export function sanitizeGpsFromExif(exifSegment: Uint8Array): Uint8Array {
  // Clone segment so original is not modified
  const segment = new Uint8Array(exifSegment);

  // Segment format: [0xFF, 0xE1, len_hi, len_lo, 'E', 'x', 'i', 'f', 0, 0, TIFF_HEADER...]
  if (segment.length < 18) return segment;

  const tiffStart = 10; // Offset where TIFF header begins
  const isLittleEndian = segment[tiffStart] === 0x49 && segment[tiffStart + 1] === 0x49; // "II"
  const isBigEndian = segment[tiffStart] === 0x4d && segment[tiffStart + 1] === 0x4d;    // "MM"

  if (!isLittleEndian && !isBigEndian) return segment;

  const view = new DataView(segment.buffer, segment.byteOffset, segment.byteLength);

  const readU16 = (pos: number) => view.getUint16(pos, isLittleEndian);
  const readU32 = (pos: number) => view.getUint32(pos, isLittleEndian);

  // IFD0 offset relative to TIFF header
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
 * Apply EXIF preservation or stripping policy to an output Blob.
 */
export async function applyExifPolicy(
  outputBlob: Blob,
  sourceBuffer: ArrayBuffer,
  outputFormat: string,
  options: { preserveExif: boolean; stripGps?: boolean },
): Promise<Blob> {
  // If user selected to strip metadata or format is not JPEG/WebP, canvas naturally stripped it
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

  if (options.stripGps) {
    exifSegment = sanitizeGpsFromExif(exifSegment);
  }

  const outputArrayBuffer = await outputBlob.arrayBuffer();
  const withExifBuffer = injectExifIntoJpeg(outputArrayBuffer, exifSegment);

  return new Blob([withExifBuffer], { type: outputBlob.type });
}
