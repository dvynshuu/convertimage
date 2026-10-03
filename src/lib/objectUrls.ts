/**
 * Object URL Management
 *
 * Ensures all allocated blob URLs are tracked, revoked when replaced,
 * and cleared upon unmount or conversion completion to prevent browser memory leaks.
 */

const activeUrls = new Set<string>();

/**
 * Create a tracked object URL for a Blob or File.
 */
export function createTrackedUrl(blob: Blob): string {
  if (typeof URL === 'undefined' || !URL.createObjectURL) {
    return '';
  }
  const url = URL.createObjectURL(blob);
  activeUrls.add(url);
  return url;
}

/**
 * Safely revoke a tracked object URL.
 */
export function revokeTrackedUrl(url: string | null | undefined): void {
  if (!url || typeof URL === 'undefined' || !URL.revokeObjectURL) {
    return;
  }
  if (activeUrls.has(url)) {
    activeUrls.delete(url);
  }
  try {
    URL.revokeObjectURL(url);
  } catch {
    // ignore revocation error
  }
}

/**
 * Replace a blob and its object URL: revokes the previous URL and creates a new one.
 */
export function replaceTrackedUrl(
  oldUrl: string | null | undefined,
  newBlob: Blob,
): string {
  if (oldUrl) {
    revokeTrackedUrl(oldUrl);
  }
  return createTrackedUrl(newBlob);
}

/**
 * Revoke all currently tracked object URLs (e.g. on application reset or unmount).
 */
export function revokeAllTrackedUrls(): void {
  if (typeof URL === 'undefined' || !URL.revokeObjectURL) {
    activeUrls.clear();
    return;
  }
  for (const url of activeUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
  activeUrls.clear();
}
