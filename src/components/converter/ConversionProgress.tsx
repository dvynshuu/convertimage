'use client';

import styles from './ConversionProgress.module.css';

interface ConversionProgressProps {
  progress: number;
  onCancel: () => void;
}

export function ConversionProgress({ progress, onCancel }: ConversionProgressProps) {
  const percentage = Math.round(progress * 100);
  const isIndeterminate = progress <= 0;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.header}>
        <span className={styles.label}>Converting your image…</span>
        {!isIndeterminate && (
          <span className={styles.percentage}>{percentage}%</span>
        )}
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Conversion progress"
      >
        <div
          className={`${styles.fill} ${isIndeterminate ? styles.indeterminate : ''}`}
          style={isIndeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>

      <button
        type="button"
        onClick={onCancel}
        className={styles.cancelBtn}
        aria-label="Cancel conversion"
      >
        Cancel
      </button>
    </div>
  );
}
