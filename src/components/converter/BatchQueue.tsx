'use client';

import { useState } from 'react';
import type { UseBatchConverterReturn } from '@/hooks/useBatchConverter';
import { formatFileSize } from '@/lib/formats';
import { FormatSelector } from './FormatSelector';
import { QualitySlider } from './QualitySlider';
import { ExifToggle } from './ExifToggle';
import styles from './BatchQueue.module.css';

interface BatchQueueProps {
  batch: UseBatchConverterReturn;
  avifSupported: boolean | null;
  onAddMoreFiles: () => void;
}

export function BatchQueue({
  batch,
  avifSupported,
  onAddMoreFiles,
}: BatchQueueProps) {
  const [showOptions, setShowOptions] = useState(true);

  const {
    items,
    outputFormat,
    quality,
    preserveExif,
    stripGps,
    isConverting,
    isZipGenerating,
    zipProgress,
    totalCount,
    successCount,
    processingCount,
    pendingCount,
    totalOriginalSize,
    totalOutputSize,
    totalSavingsPercent,
    setOutputFormat,
    setQuality,
    setPreserveExif,
    setStripGps,
    convertAll,
    cancelAll,
    clearAll,
    downloadAllZip,
    downloadSingle,
    removeItem,
    cancelItem,
  } = batch;

  return (
    <div className={styles.container}>
      {/* Top Header & Summary */}
      <div className={styles.header}>
        <div className={styles.statsCol}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Batch Queue</h2>
            <span className={styles.itemCountBadge}>
              {totalCount} {totalCount === 1 ? 'file' : 'files'}
            </span>
          </div>
          <span className={styles.statsMeta}>
            {successCount > 0 ? (
              <>
                {successCount} of {totalCount} completed
                {processingCount > 0 ? ` · ${processingCount} converting` : ''} ·{' '}
                {formatFileSize(totalOriginalSize)} &rarr; {formatFileSize(totalOutputSize)}
                <span className={styles.savingsBadge}>
                  (-{totalSavingsPercent}% saved)
                </span>
              </>
            ) : (
              `${pendingCount} ready to convert · Total: ${formatFileSize(totalOriginalSize)}`
            )}
          </span>
        </div>

        <div className={styles.headerActions}>
          {isConverting ? (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={cancelAll}
            >
              Cancel All
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={convertAll}
              disabled={pendingCount === 0}
            >
              Convert All ({pendingCount})
            </button>
          )}

          {successCount > 0 && (
            <button
              type="button"
              className={styles.zipBtn}
              onClick={downloadAllZip}
              disabled={isZipGenerating}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>
                {isZipGenerating
                  ? `Archiving ${zipProgress}%…`
                  : `Download All as ZIP (${successCount})`}
              </span>
            </button>
          )}

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onAddMoreFiles}
          >
            + Add files
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={clearAll}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Global Batch Settings Toggle */}
      <div>
        <button
          type="button"
          className={styles.secondaryBtn}
          style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          onClick={() => setShowOptions(!showOptions)}
          aria-expanded={showOptions}
        >
          {showOptions ? 'Hide Batch Settings' : 'Adjust Batch Settings'}
        </button>

        {showOptions && (
          <div className={styles.optionsAccordion} style={{ marginTop: '0.75rem' }}>
            <FormatSelector
              selected={outputFormat}
              onChange={setOutputFormat}
              avifSupported={avifSupported}
            />

            <QualitySlider
              format={outputFormat}
              quality={quality}
              onChange={setQuality}
            />

            <ExifToggle
              preserveExif={preserveExif}
              stripGps={stripGps}
              onPreserveChange={setPreserveExif}
              onStripGpsChange={setStripGps}
            />
          </div>
        )}
      </div>

      {/* List of items */}
      <div className={styles.list} role="list" aria-label="Batch images">
        {items.map((item) => (
          <div key={item.id} className={styles.itemRow} role="listitem">
            <div className={styles.itemMain}>
              <div className={styles.thumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="Thumbnail" />
              </div>
              <div className={styles.itemDetails}>
                <span className={styles.itemName} title={item.name}>
                  {item.name}
                </span>
                <span className={styles.itemMeta}>
                  {formatFileSize(item.originalSize)} · {item.inputFormat.toUpperCase()} &rarr; {outputFormat.toUpperCase()}
                  {item.result && (
                    <span>
                      {' '}
                      &bull; Converted: {formatFileSize(item.result.outputSize)}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className={styles.itemStatus}>
              {item.status === 'processing' && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.round(item.progress * 100)}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.actionIconBtn}
                    onClick={() => cancelItem(item.id)}
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              )}

              {item.status === 'pending' && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ready
                </span>
              )}

              {item.status === 'success' && (
                <>
                  <span className={styles.statusSuccess}>
                    ✓ Done
                  </span>
                  <button
                    type="button"
                    className={styles.actionIconBtn}
                    onClick={() => downloadSingle(item.id)}
                    title="Download image"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </>
              )}

              {item.status === 'error' && (
                <span className={styles.statusError} title={item.error?.userMessage}>
                  Failed
                </span>
              )}

              <button
                type="button"
                className={styles.actionIconBtn}
                onClick={() => removeItem(item.id)}
                title="Remove from batch"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
