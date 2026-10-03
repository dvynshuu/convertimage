'use client';

import styles from './ExifToggle.module.css';

interface ExifToggleProps {
  preserveExif: boolean;
  stripGps: boolean;
  onPreserveChange: (preserve: boolean) => void;
  onStripGpsChange: (strip: boolean) => void;
  className?: string;
}

export function ExifToggle({
  preserveExif,
  stripGps,
  onPreserveChange,
  onStripGpsChange,
  className = '',
}: ExifToggleProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <label className={styles.mainRow}>
        <input
          type="checkbox"
          checked={preserveExif}
          onChange={(e) => onPreserveChange(e.target.checked)}
          className={styles.checkbox}
        />
        <div className={styles.textGroup}>
          <span className={styles.label}>Preserve Camera & Date Metadata (EXIF)</span>
          <span className={styles.description}>
            {preserveExif
              ? 'Original camera model, shutter speed, and timestamp will be retained.'
              : 'All metadata is stripped by default to protect your privacy and reduce file size.'}
          </span>
        </div>
      </label>

      {preserveExif && (
        <label className={styles.subOptions}>
          <input
            type="checkbox"
            checked={!stripGps}
            onChange={(e) => onStripGpsChange(!e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.subLabel}>
            Include GPS Geolocation (Uncheck to keep coordinates private)
          </span>
        </label>
      )}
    </div>
  );
}
