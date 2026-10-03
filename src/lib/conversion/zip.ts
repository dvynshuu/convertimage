import JSZip from 'jszip';

export interface ZipFileItem {
  filename: string;
  blob: Blob;
}

/**
 * Packages multiple blobs into a single .zip file and triggers browser download.
 */
export async function downloadZip(
  items: ZipFileItem[],
  zipFilename: string = 'convertimage-converted-images.zip',
  onProgress?: (percent: number) => void,
): Promise<void> {
  if (items.length === 0) return;

  const zip = new JSZip();
  const usedNames = new Set<string>();

  // Add each file with duplicate filename resolution
  for (const item of items) {
    let finalName = item.filename;
    let counter = 1;

    const dotIndex = finalName.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? finalName.slice(0, dotIndex) : finalName;
    const ext = dotIndex !== -1 ? finalName.slice(dotIndex) : '';

    while (usedNames.has(finalName.toLowerCase())) {
      finalName = `${baseName}-${counter}${ext}`;
      counter++;
    }

    usedNames.add(finalName.toLowerCase());
    zip.file(finalName, item.blob);
  }

  // Generate zip file with compression
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent));
    },
  );

  // Trigger download
  const objectUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release memory after small delay
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 10000);
}
