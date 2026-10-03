'use client';

import type { OutputFormat } from '@/lib/types';
import { QUALITY_RANGE } from '@/lib/constants';
import styles from './QualitySlider.module.css';

interface QualitySliderProps {
  format: OutputFormat;
  quality: number;
  onChange: (quality: number) => void;
}

const FORMAT_LABELS: Record<OutputFormat, string | null> = {
  jpg: 'Quality',
  png: null, // PNG is lossless
  webp: 'Quality',
  avif: 'Quality',
};

export function QualitySlider({ format, quality, onChange }: QualitySliderProps) {
  if (!FORMAT_LABELS[format]) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.losslessNote}>
          PNG is lossless and does not use a quality setting.
        </p>
      </div>
    );
  }

  const percentage = Math.round(quality * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <label htmlFor="quality-slider" className={styles.label}>
          {FORMAT_LABELS[format]}
        </label>
        <span className={styles.value}>{percentage}%</span>
      </div>
      <input
        id="quality-slider"
        type="range"
        min={QUALITY_RANGE.min * 100}
        max={QUALITY_RANGE.max * 100}
        step={1}
        value={percentage}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className={styles.slider}
        aria-label={`Quality: ${percentage}%`}
        aria-valuemin={1}
        aria-valuemax={100}
        aria-valuenow={percentage}
      />
      <div className={styles.hints}>
        <span>Smaller file</span>
        <span>Higher quality</span>
      </div>
    </div>
  );
}
