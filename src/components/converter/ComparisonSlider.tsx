'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './ComparisonSlider.module.css';

interface ComparisonSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ComparisonSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Original',
  afterLabel = 'Converted',
  className = '',
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      role="region"
      aria-label="Image comparison slider"
    >
      {/* Background (After / Converted) layer */}
      <div className={styles.imageLayer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt={afterLabel}
          className={styles.image}
        />
        <span className={`${styles.badge} ${styles.badgeRight}`}>{afterLabel}</span>
      </div>

      {/* Foreground (Before / Original) clipped layer */}
      <div
        className={styles.clipLayer}
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className={styles.image}
        />
        <span className={`${styles.badge} ${styles.badgeLeft}`}>{beforeLabel}</span>
      </div>

      {/* Vertical divider line */}
      <div
        className={styles.divider}
        style={{ left: `${sliderPosition}%` }}
      >
        <div className={styles.handle}>
          <div className={styles.handleIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Accessible range input covering entire slider */}
      <input
        type="range"
        min={0}
        max={100}
        value={sliderPosition}
        onChange={handleSliderChange}
        className={styles.sliderInput}
        aria-label="Slide to compare original and converted images"
        aria-valuenow={sliderPosition}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
