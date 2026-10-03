'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  ConversionState,
  ConversionOptions,
  ConversionResult,
  InputFormat,
  OutputFormat,
  ValidationResult,
} from '@/lib/types';
import { validateFile, detectFormat } from '@/lib/formats';
import { checkAvifSupport } from '@/lib/conversion/engine';
import { executeConversionJob } from '@/lib/conversion/pipeline';
import { globalWorkerPool } from '@/lib/conversion/workerPool';
import { DEFAULT_QUALITY } from '@/lib/constants';
import { createConversionError, isConversionError } from '@/lib/errors';
import { createTrackedUrl, revokeTrackedUrl } from '@/lib/objectUrls';

export interface UseImageConverterReturn {
  /** Current state of the conversion pipeline */
  state: ConversionState;

  /** The selected file */
  file: File | null;

  /** Validation result */
  validation: ValidationResult | null;

  /** Detected input format */
  inputFormat: InputFormat | null;

  /** Selected output format */
  outputFormat: OutputFormat;

  /** Quality setting (0-1) */
  quality: number;

  /** Resize width (undefined = original) */
  resizeWidth: number | undefined;

  /** Resize height (undefined = original) */
  resizeHeight: number | undefined;

  /** Aspect ratio lock */
  maintainAspectRatio: boolean;

  /** EXIF preservation options */
  preserveExif: boolean;
  stripGps: boolean;
  setPreserveExif: (preserve: boolean) => void;
  setStripGps: (strip: boolean) => void;

  /** Whether AVIF is supported in current browser */
  avifSupported: boolean | null;

  /** Original image preview URL */
  originalPreviewUrl: string | null;

  /** Original dimensions */
  originalWidth: number | null;
  originalHeight: number | null;

  /* ─── Actions ─── */

  /** Handle file selection with race condition protection */
  selectFile: (file: File) => Promise<void>;

  /** Set the output format */
  setOutputFormat: (format: OutputFormat) => void;

  /** Set quality */
  setQuality: (quality: number) => void;

  /** Set resize dimensions */
  setResizeWidth: (width: number | undefined) => void;
  setResizeHeight: (height: number | undefined) => void;
  setMaintainAspectRatio: (lock: boolean) => void;

  /** Start conversion */
  convert: () => Promise<void>;

  /** Cancel ongoing conversion */
  cancel: () => void;

  /** Reset to initial state */
  reset: () => void;

  /** Download the converted file */
  download: () => void;
}

export function useImageConverter(
  initialOutputFormat?: OutputFormat,
): UseImageConverterReturn {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [inputFormat, setInputFormat] = useState<InputFormat | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(initialOutputFormat ?? 'webp');
  const [quality, setQuality] = useState<number>(DEFAULT_QUALITY[initialOutputFormat ?? 'webp']);
  const [resizeWidth, setResizeWidth] = useState<number | undefined>(undefined);
  const [resizeHeight, setResizeHeight] = useState<number | undefined>(undefined);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [preserveExif, setPreserveExif] = useState(false);
  const [stripGps, setStripGps] = useState(true);
  const [avifSupported, setAvifSupported] = useState<boolean | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number | null>(null);
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentJobIdRef = useRef<string | null>(null);
  const previousResultRef = useRef<ConversionResult | null>(null);
  const selectionGenerationRef = useRef(0);

  // Check AVIF capability at runtime
  useEffect(() => {
    checkAvifSupport().then(setAvifSupported);
  }, []);

  const cleanup = useCallback(() => {
    if (previousResultRef.current?.objectUrl) {
      revokeTrackedUrl(previousResultRef.current.objectUrl);
      previousResultRef.current = null;
    }
    if (originalPreviewUrl) {
      revokeTrackedUrl(originalPreviewUrl);
      setOriginalPreviewUrl(null);
    }
  }, [originalPreviewUrl]);

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      if (currentJobIdRef.current) {
        globalWorkerPool.cancel(currentJobIdRef.current);
      }
      if (previousResultRef.current?.objectUrl) {
        revokeTrackedUrl(previousResultRef.current.objectUrl);
      }
    };
  }, []);

  /**
   * Select a file with generation counter protection against async race conditions.
   */
  const selectFile = useCallback(async (newFile: File) => {
    const generation = ++selectionGenerationRef.current;

    // Clean up previous state
    cleanup();
    setFile(newFile);
    setState({ status: 'validating' });
    setResizeWidth(undefined);
    setResizeHeight(undefined);

    // Create tracked preview URL
    const previewUrl = createTrackedUrl(newFile);
    if (generation !== selectionGenerationRef.current) {
      revokeTrackedUrl(previewUrl);
      return;
    }
    setOriginalPreviewUrl(previewUrl);

    // Shared validation pipeline
    const result = await validateFile(newFile);
    if (generation !== selectionGenerationRef.current) {
      return;
    }

    setValidation(result);

    if (!result.valid) {
      setState({
        status: 'error',
        error: result.error || createConversionError('INVALID_FILE'),
      });
      return;
    }

    // Format detection
    const detected = result.format ?? await detectFormat(newFile);
    if (generation !== selectionGenerationRef.current) {
      return;
    }

    setInputFormat(detected);

    if (result.width) setOriginalWidth(result.width);
    if (result.height) setOriginalHeight(result.height);

    if ((detected === 'heic' || detected === 'heif') && !result.width) {
      setOriginalWidth(null);
      setOriginalHeight(null);
    }

    // Auto-select appropriate output format for HEIC if not explicitly set by route
    if (detected === 'heic' || detected === 'heif') {
      if (!initialOutputFormat) {
        setOutputFormat('jpg');
        setQuality(DEFAULT_QUALITY.jpg);
      }
    }

    setState({ status: 'idle' });
  }, [cleanup, initialOutputFormat]);

  /**
   * Convert file using canonical worker-backed pipeline.
   */
  const convert = useCallback(async () => {
    if (!file || !inputFormat) return;

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (previousResultRef.current?.objectUrl) {
      revokeTrackedUrl(previousResultRef.current.objectUrl);
      previousResultRef.current = null;
    }

    setState({ status: 'processing', progress: 0 });

    const jobId = `single-${Date.now()}`;
    currentJobIdRef.current = jobId;

    const options: ConversionOptions = {
      inputFormat,
      outputFormat,
      quality,
      width: resizeWidth,
      height: resizeHeight,
      maintainAspectRatio,
      preserveExif,
      stripGps,
    };

    try {
      const result = await executeConversionJob(
        jobId,
        file,
        options,
        (progress) => {
          if (!abortController.signal.aborted) {
            setState({ status: 'processing', progress });
          }
        },
        abortController.signal,
      );

      previousResultRef.current = result;
      setState({ status: 'success', result });

      if (!originalWidth && result.originalWidth) {
        setOriginalWidth(result.originalWidth);
      }
      if (!originalHeight && result.originalHeight) {
        setOriginalHeight(result.originalHeight);
      }
    } catch (err) {
      if (abortController.signal.aborted) {
        setState({ status: 'cancelled' });
      } else {
        const error = isConversionError(err)
          ? err
          : createConversionError('UNKNOWN', {
              message: err instanceof Error ? err.message : 'Unknown error',
            });
        setState({ status: 'error', error });
      }
    }
  }, [
    file,
    inputFormat,
    outputFormat,
    quality,
    resizeWidth,
    resizeHeight,
    maintainAspectRatio,
    preserveExif,
    stripGps,
    originalWidth,
    originalHeight,
  ]);

  const cancel = useCallback(() => {
    if (currentJobIdRef.current) {
      globalWorkerPool.cancel(currentJobIdRef.current);
    }
    abortControllerRef.current?.abort();
    setState({ status: 'cancelled' });
  }, []);

  const reset = useCallback(() => {
    selectionGenerationRef.current++;
    if (currentJobIdRef.current) {
      globalWorkerPool.cancel(currentJobIdRef.current);
    }
    abortControllerRef.current?.abort();
    cleanup();
    setFile(null);
    setValidation(null);
    setInputFormat(null);
    setOriginalPreviewUrl(null);
    setOriginalWidth(null);
    setOriginalHeight(null);
    setResizeWidth(undefined);
    setResizeHeight(undefined);
    setState({ status: 'idle' });
  }, [cleanup]);

  const download = useCallback(() => {
    if (state.status !== 'success' || !state.result.objectUrl) return;

    const a = document.createElement('a');
    a.href = state.result.objectUrl;
    a.download = state.result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [state]);

  const handleSetOutputFormat = useCallback((format: OutputFormat) => {
    setOutputFormat(format);
    setQuality(DEFAULT_QUALITY[format]);
  }, []);

  return {
    state,
    file,
    validation,
    inputFormat,
    outputFormat,
    quality,
    resizeWidth,
    resizeHeight,
    maintainAspectRatio,
    preserveExif,
    stripGps,
    avifSupported,
    originalPreviewUrl,
    originalWidth,
    originalHeight,
    selectFile,
    setOutputFormat: handleSetOutputFormat,
    setQuality,
    setResizeWidth,
    setResizeHeight,
    setMaintainAspectRatio,
    setPreserveExif,
    setStripGps,
    convert,
    cancel,
    reset,
    download,
  };
}
