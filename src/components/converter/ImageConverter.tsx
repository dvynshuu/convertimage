'use client';

import { useRef, useState } from 'react';
import type { OutputFormat } from '@/lib/types';
import { useImageConverter } from '@/hooks/useImageConverter';
import { useBatchConverter } from '@/hooks/useBatchConverter';
import { formatFileSize } from '@/lib/formats';
import { ACCEPT_STRING, IMAGE_LIMITS } from '@/lib/constants';
import { UploadZone } from './UploadZone';
import { FormatSelector } from './FormatSelector';
import { QualitySlider } from './QualitySlider';
import { ResizeControls } from './ResizeControls';
import { ExifToggle } from './ExifToggle';
import { ConversionProgress } from './ConversionProgress';
import { ResultCard } from './ResultCard';
import { ErrorState } from './ErrorState';
import { BatchQueue } from './BatchQueue';
import styles from './ImageConverter.module.css';

interface ImageConverterProps {
  initialOutputFormat?: OutputFormat;
  acceptedFormatsText?: string;
  className?: string;
}

export function ImageConverter({
  initialOutputFormat = 'webp',
  acceptedFormatsText,
  className = '',
}: ImageConverterProps) {
  const maxBatchFiles = IMAGE_LIMITS.maxBatchFiles;
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single file converter state
  const single = useImageConverter(initialOutputFormat);

  // Batch converter state
  const batch = useBatchConverter(initialOutputFormat);

  // Handle files from UploadZone
  const handleFilesSelect = async (files: File[]) => {
    if (files.length === 0) return;

    if (files.length === 1 && batch.items.length === 0) {
      setMode('single');
      await single.selectFile(files[0]);
    } else {
      setMode('batch');
      await batch.addFiles(files, maxBatchFiles);
    }
  };

  const handleAddMoreFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      await batch.addFiles(fileList, maxBatchFiles);
      e.target.value = '';
    }
  };

  // ─── Render Batch Mode ───
  if (mode === 'batch' && batch.items.length > 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        <BatchQueue
          batch={batch}
          avifSupported={single.avifSupported}
          onAddMoreFiles={handleAddMoreFiles}
        />
      </div>
    );
  }

  // ─── Render Single Image Mode ───

  // 1. Success state: show result card
  if (single.state.status === 'success') {
    return (
      <div className={`${styles.container} ${className}`}>
        <ResultCard
          result={single.state.result}
          originalPreviewUrl={single.originalPreviewUrl}
          inputFormat={single.inputFormat}
          onDownload={single.download}
          onReset={single.reset}
        />
      </div>
    );
  }

  // 2. Error state: show error with recovery
  if (single.state.status === 'error') {
    return (
      <div className={`${styles.container} ${className}`}>
        <ErrorState
          error={single.state.error}
          onRetry={single.file ? single.convert : undefined}
          onReset={single.reset}
        />
      </div>
    );
  }

  // 3. Validating state: checking dimensions / format
  if (single.state.status === 'validating') {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.validatingState} role="status">
          <div className={styles.spinner} />
          <p>Analyzing image format…</p>
        </div>
      </div>
    );
  }

  // 4. File selected: show controls and convert button or progress
  if (single.file) {
    const isProcessing = single.state.status === 'processing';

    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.filePreviewCard}>
          {/* File summary header */}
          <div className={styles.fileHeader}>
            <div className={styles.fileInfo}>
              {single.originalPreviewUrl && (
                <div className={styles.fileThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={single.originalPreviewUrl} alt="Thumbnail preview" />
                </div>
              )}
              <div className={styles.fileNameMeta}>
                <span className={styles.fileName} title={single.file.name}>{single.file.name}</span>
                <span className={styles.fileMeta}>
                  {formatFileSize(single.file.size)}
                  {single.originalWidth && single.originalHeight ? ` · ${single.originalWidth} × ${single.originalHeight} px` : ''}
                  {single.inputFormat ? ` · ${single.inputFormat.toUpperCase()}` : ''}
                </span>
              </div>
            </div>

            {!isProcessing && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={styles.changeFileBtn}
                  onClick={async () => {
                    // Switch to batch mode with this file
                    setMode('batch');
                    await batch.addFiles([single.file!], maxBatchFiles);
                    single.reset();
                  }}
                >
                  + Add to Batch
                </button>
                <button
                  type="button"
                  className={styles.changeFileBtn}
                  onClick={single.reset}
                >
                  Change file
                </button>
              </div>
            )}
          </div>

          {/* Options: Output format, Quality, Resize, EXIF */}
          <div className={styles.optionsSection}>
            <FormatSelector
              selected={single.outputFormat}
              onChange={single.setOutputFormat}
              avifSupported={single.avifSupported}
            />

            <QualitySlider
              format={single.outputFormat}
              quality={single.quality}
              onChange={single.setQuality}
            />

            <ResizeControls
              originalWidth={single.originalWidth}
              originalHeight={single.originalHeight}
              width={single.resizeWidth}
              height={single.resizeHeight}
              maintainAspectRatio={single.maintainAspectRatio}
              onWidthChange={single.setResizeWidth}
              onHeightChange={single.setResizeHeight}
              onAspectRatioChange={single.setMaintainAspectRatio}
            />

            <ExifToggle
              preserveExif={single.preserveExif}
              stripGps={single.stripGps}
              onPreserveChange={single.setPreserveExif}
              onStripGpsChange={single.setStripGps}
            />

            {/* Action: Converting or Trigger Conversion */}
            {isProcessing ? (
              <ConversionProgress
                progress={single.state.status === 'processing' ? single.state.progress : 0}
                onCancel={single.cancel}
              />
            ) : (
              <div>
                <button
                  type="button"
                  className={styles.convertButton}
                  onClick={single.convert}
                  disabled={single.outputFormat === 'avif' && single.avifSupported === false}
                >
                  Convert to {single.outputFormat.toUpperCase()}
                </button>
                <p className={styles.privacyNote}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Processed locally on your device — never leaves your browser</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. Idle state (no file): show UploadZone
  return (
    <div className={`${styles.container} ${className}`}>
      <UploadZone
        onFilesSelect={handleFilesSelect}
        formats={acceptedFormatsText}
      />
    </div>
  );
}
