/* ─── Image Format Types ─── */

export type InputFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'heic' | 'heif';
export type OutputFormat = 'jpg' | 'png' | 'webp' | 'avif';

export const INPUT_FORMATS: InputFormat[] = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif'];
export const OUTPUT_FORMATS: OutputFormat[] = ['jpg', 'png', 'webp', 'avif'];

export const FORMAT_MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
};

export const MIME_FORMAT_MAP: Record<string, InputFormat> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  jpg: '.jpg',
  png: '.png',
  webp: '.webp',
  avif: '.avif',
};

/* ─── Conversion Options ─── */

export interface ConversionOptions {
  inputFormat: InputFormat;
  outputFormat: OutputFormat;
  quality: number;         // 0-1
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

/* ─── Conversion Result ─── */

export interface ConversionResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  originalSize: number;
  outputSize: number;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  durationMs: number;
  objectUrl: string;
}

/* ─── State Machine ─── */

export type ConversionState =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'processing'; progress: number }
  | { status: 'success'; result: ConversionResult }
  | { status: 'error'; error: ConversionError }
  | { status: 'cancelled' };

/* ─── Conversion Job ─── */

export interface ConversionJob {
  id: string;
  file: File;
  options: ConversionOptions;
  state: ConversionState;
  createdAt: number;
}

/* ─── Errors ─── */

export type ConversionErrorType =
  | 'unsupported_format'
  | 'corrupted_file'
  | 'file_too_large'
  | 'dimensions_too_large'
  | 'decode_failure'
  | 'encode_failure'
  | 'browser_limitation'
  | 'memory_limitation'
  | 'worker_failure'
  | 'cancelled'
  | 'unknown';

export interface ConversionError {
  type: ConversionErrorType;
  message: string;
  userMessage: string;
  recoveryAction?: string;
  technicalDetails?: string;
}

/* ─── File Validation ─── */

export interface ValidationResult {
  valid: boolean;
  format?: InputFormat;
  width?: number;
  height?: number;
  fileSize: number;
  error?: ConversionError;
}

/* ─── Worker Protocol ─── */

export type WorkerRequest =
  | {
      type: 'convert';
      jobId: string;
      buffer: ArrayBuffer;
      inputFormat: InputFormat;
      outputFormat: OutputFormat;
      quality: number;
      width?: number;
      height?: number;
      maintainAspectRatio: boolean;
    }
  | {
      type: 'cancel';
      jobId: string;
    };

export type WorkerResponse =
  | {
      type: 'progress';
      jobId: string;
      progress: number;
    }
  | {
      type: 'success';
      jobId: string;
      buffer: ArrayBuffer;
      mimeType: string;
      width: number;
      height: number;
      durationMs: number;
    }
  | {
      type: 'error';
      jobId: string;
      error: string;
      errorType: ConversionErrorType;
    };

/* ─── Format Info (for SEO/education pages) ─── */

export interface FormatInfo {
  name: string;
  fullName: string;
  extension: string;
  mimeType: string;
  lossy: boolean;
  supportsTransparency: boolean;
  description: string;
  goodFor: string[];
  limitations: string[];
}

/* ─── SEO Route Conversion Pair ─── */

export interface ConversionRoute {
  slug: string;
  from: InputFormat;
  to: OutputFormat;
  title: string;
  description: string;
}

/* ─── Resize Preset ─── */

export type ResizePreset = 'original' | '25' | '50' | '75' | 'custom';

export interface ResizeOptions {
  preset: ResizePreset;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}
