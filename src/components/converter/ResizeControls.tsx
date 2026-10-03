'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ResizePreset } from '@/lib/types';
import styles from './ResizeControls.module.css';

interface ResizeControlsProps {
  originalWidth: number | null;
  originalHeight: number | null;
  width: number | undefined;
  height: number | undefined;
  maintainAspectRatio: boolean;
  preset?: ResizePreset;
  onPresetChange?: (preset: ResizePreset) => void;
  onWidthChange: (w: number | undefined) => void;
  onHeightChange: (h: number | undefined) => void;
  onAspectRatioChange: (locked: boolean) => void;
}

export function ResizeControls({
  originalWidth,
  originalHeight,
  width,
  height,
  maintainAspectRatio,
  preset: externalPreset,
  onPresetChange,
  onWidthChange,
  onHeightChange,
  onAspectRatioChange,
}: ResizeControlsProps) {
  const [internalPreset, setInternalPreset] = useState<ResizePreset>('original');
  const activePreset = externalPreset !== undefined ? externalPreset : internalPreset;

  const aspectRatio =
    originalWidth && originalHeight && originalHeight > 0
      ? originalWidth / originalHeight
      : 1;

  const handlePreset = useCallback(
    (p: ResizePreset) => {
      setInternalPreset(p);
      onPresetChange?.(p);

      if (p === 'original') {
        onWidthChange(undefined);
        onHeightChange(undefined);
        return;
      }

      if (originalWidth && originalHeight && p !== 'custom') {
        const scale = Number(p) / 100;
        if (!isNaN(scale)) {
          onWidthChange(Math.round(originalWidth * scale));
          onHeightChange(Math.round(originalHeight * scale));
          return;
        }
      }

      // If dimensions are unknown (e.g. batch mode across different files)
      if (p !== 'custom') {
        onWidthChange(undefined);
        onHeightChange(undefined);
      }
    },
    [originalWidth, originalHeight, onPresetChange, onWidthChange, onHeightChange],
  );

  const handleWidthChange = useCallback(
    (value: string) => {
      const w = value ? parseInt(value, 10) : undefined;
      if (w !== undefined && isNaN(w)) return;

      setInternalPreset('custom');
      onPresetChange?.('custom');
      onWidthChange(w);

      if (w && maintainAspectRatio && originalWidth && originalHeight) {
        onHeightChange(Math.round(w / aspectRatio));
      }
    },
    [maintainAspectRatio, aspectRatio, originalWidth, originalHeight, onPresetChange, onWidthChange, onHeightChange],
  );

  const handleHeightChange = useCallback(
    (value: string) => {
      const h = value ? parseInt(value, 10) : undefined;
      if (h !== undefined && isNaN(h)) return;

      setInternalPreset('custom');
      onPresetChange?.('custom');
      onHeightChange(h);

      if (h && maintainAspectRatio && originalWidth && originalHeight) {
        onWidthChange(Math.round(h * aspectRatio));
      }
    },
    [maintainAspectRatio, aspectRatio, originalWidth, originalHeight, onPresetChange, onWidthChange, onHeightChange],
  );

  // Sync aspect ratio when locked
  useEffect(() => {
    if (maintainAspectRatio && width && !height && originalWidth && originalHeight) {
      onHeightChange(Math.round(width / aspectRatio));
    }
  }, [maintainAspectRatio, width, height, aspectRatio, originalWidth, originalHeight, onHeightChange]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>Resize</span>
        {originalWidth && originalHeight && (
          <span className={styles.originalDims}>
            {originalWidth} × {originalHeight}
          </span>
        )}
      </div>

      <div className={styles.presets}>
        {(['original', '75', '50', '25'] as ResizePreset[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles.presetBtn} ${activePreset === p ? styles.presetActive : ''}`}
            onClick={() => handlePreset(p)}
          >
            {p === 'original' ? 'Original' : `${p}%`}
          </button>
        ))}
      </div>

      <div className={styles.inputs}>
        <div className={styles.inputGroup}>
          <label htmlFor="resize-width" className={styles.inputLabel}>
            W
          </label>
          <input
            id="resize-width"
            type="number"
            min={1}
            max={16384}
            placeholder={originalWidth ? originalWidth.toString() : 'Width'}
            value={width ?? ''}
            onChange={(e) => handleWidthChange(e.target.value)}
            className={styles.input}
            aria-label="Width in pixels"
          />
        </div>

        <button
          type="button"
          className={`${styles.lockBtn} ${maintainAspectRatio ? styles.locked : ''}`}
          onClick={() => onAspectRatioChange(!maintainAspectRatio)}
          aria-label={maintainAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          title={maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {maintainAspectRatio ? (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </>
            ) : (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </>
            )}
          </svg>
        </button>

        <div className={styles.inputGroup}>
          <label htmlFor="resize-height" className={styles.inputLabel}>
            H
          </label>
          <input
            id="resize-height"
            type="number"
            min={1}
            max={16384}
            placeholder={originalHeight ? originalHeight.toString() : 'Height'}
            value={height ?? ''}
            onChange={(e) => handleHeightChange(e.target.value)}
            className={styles.input}
            aria-label="Height in pixels"
          />
        </div>
      </div>
    </div>
  );
}
