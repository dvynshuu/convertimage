import type { ConversionError, ConversionErrorCode } from './types';

const ERROR_DEFINITIONS: Record<
  ConversionErrorCode,
  { userMessage: string; recoveryAction?: string }
> = {
  INVALID_FILE: {
    userMessage: 'The selected file is empty or unreadable.',
    recoveryAction: 'Please select a valid image file.',
  },
  UNSUPPORTED_FORMAT: {
    userMessage: "This file doesn't appear to be a supported image format.",
    recoveryAction: 'Try JPG, PNG, WebP, AVIF, or HEIC.',
  },
  FILE_TOO_LARGE: {
    userMessage: 'This image is too large to process safely in your browser.',
    recoveryAction: 'Please choose an image under 25 MB.',
  },
  IMAGE_TOO_LARGE: {
    userMessage: "This image's dimensions exceed safe browser processing limits.",
    recoveryAction: 'Try scaling down the image or choose a smaller photo.',
  },
  DECODE_FAILED: {
    userMessage: "We couldn't read this image file.",
    recoveryAction: 'The file may be corrupted or damaged. Try another file.',
  },
  ENCODE_FAILED: {
    userMessage: "We couldn't encode the image in this format.",
    recoveryAction: 'Try a different output format or reduce quality/dimensions.',
  },
  BROWSER_UNSUPPORTED: {
    userMessage: 'Your browser does not support this conversion.',
    recoveryAction: 'Try using Chrome, Edge, or Firefox for full compatibility.',
  },
  MEMORY_LIMIT: {
    userMessage: 'Not enough browser memory to process this image.',
    recoveryAction: 'Close other tabs and try again with a smaller image.',
  },
  CANCELLED: {
    userMessage: 'Conversion was cancelled.',
    recoveryAction: 'Restart conversion when ready.',
  },
  WORKER_ERROR: {
    userMessage: 'An internal processing error occurred in the image worker.',
    recoveryAction: 'Please try again.',
  },
  TIMEOUT: {
    userMessage: 'Image conversion timed out before completing.',
    recoveryAction: 'Try a smaller image or reduce output dimensions.',
  },
  UNKNOWN: {
    userMessage: "We couldn't convert this image.",
    recoveryAction: 'Try another file.',
  },
};

/**
 * Standard factory for strongly-typed conversion errors.
 */
export function createConversionError(
  code: ConversionErrorCode,
  details?: {
    message?: string;
    userMessage?: string;
    recoveryAction?: string;
    technicalDetails?: string;
  },
): ConversionError {
  const def = ERROR_DEFINITIONS[code] || ERROR_DEFINITIONS.UNKNOWN;

  return {
    code,
    type: code.toLowerCase(),
    message: details?.message || details?.userMessage || def.userMessage,
    userMessage: details?.userMessage || def.userMessage,
    recoveryAction: details?.recoveryAction || def.recoveryAction,
    technicalDetails: details?.technicalDetails,
  };
}

/**
 * Type guard for ConversionError.
 */
export function isConversionError(err: unknown): err is ConversionError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'userMessage' in err
  );
}
