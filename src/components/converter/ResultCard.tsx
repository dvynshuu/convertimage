'use client';

import { useState } from 'react';
import type { ConversionResult } from '@/lib/types';
import { formatFileSize, calculateSavings } from '@/lib/formats';
import { DownloadButton } from './DownloadButton';
import { ComparisonSlider } from './ComparisonSlider';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  result: ConversionResult;
  originalPreviewUrl: string | null;
  inputFormat: string | null;
  onDownload: () => void;
  onReset: () => void;
}

export function ResultCard({
  result,
  originalPreviewUrl,
  inputFormat,
  onDownload,
  onReset,
}: ResultCardProps) {
  const [showComparison, setShowComparison] = useState(false);
  const savings = calculateSavings(result.originalSize, result.outputSize);
  const formattedOriginalSize = formatFileSize(result.originalSize);
  const formattedOutputSize = formatFileSize(result.outputSize);

  return (
    <div className={styles.card} role="region" aria-label="Conversion result">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.successIcon} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </span>
          <h2 className={styles.title}>Your image is ready</h2>
        </div>
        <span className={styles.duration}>
          Converted in {result.durationMs}ms
        </span>
      </div>

      {/* Before / After Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCol}>
          <span className={styles.statLabel}>Original ({inputFormat?.toUpperCase() || 'FILE'})</span>
          <span className={styles.statValue}>{formattedOriginalSize}</span>
          <span className={styles.statMeta}>
            {result.originalWidth > 0 ? `${result.originalWidth} × ${result.originalHeight} px` : 'Original dimensions'}
          </span>
        </div>

        <div className={styles.statCol}>
          <span className={styles.statLabel}>Converted ({result.filename.split('.').pop()?.toUpperCase()})</span>
          <span className={styles.statValue}>{formattedOutputSize}</span>
          <span className={styles.statMeta}>
            {result.outputWidth} × {result.outputHeight} px
          </span>
        </div>
      </div>

      {/* Savings Summary */}
      <div className={`${styles.savingsRow} ${savings.isSmaller ? styles.savingsPositive : styles.savingsNeutral}`}>
        <span>
          {savings.isSmaller
            ? `Reduced by ${savings.percentage}% (${formatFileSize(result.originalSize - result.outputSize)} smaller)`
            : savings.percentage === 0
            ? 'Output size is identical'
            : `File is ${savings.percentage}% larger (${formatFileSize(result.outputSize - result.originalSize)} increase)`}
        </span>
      </div>

      {/* Preview / Comparison */}
      <div className={styles.previewSection}>
        {originalPreviewUrl && (
          <button
            type="button"
            className={styles.previewToggle}
            onClick={() => setShowComparison(!showComparison)}
            aria-expanded={showComparison}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
            <span>{showComparison ? 'Hide comparison' : 'Compare before and after'}</span>
          </button>
        )}

        {showComparison && originalPreviewUrl ? (
          <ComparisonSlider
            beforeSrc={originalPreviewUrl}
            afterSrc={result.objectUrl}
            beforeLabel={`Original (${inputFormat?.toUpperCase()})`}
            afterLabel={`Converted (${result.filename.split('.').pop()?.toUpperCase()})`}
          />
        ) : (
          <div className={styles.simplePreview}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.objectUrl}
              alt="Converted preview"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <DownloadButton
          onClick={onDownload}
          filename={result.filename}
          fileSize={formattedOutputSize}
        />
        <button
          type="button"
          className={styles.resetButton}
          onClick={onReset}
        >
          Convert another image
        </button>
      </div>
    </div>
  );
}
