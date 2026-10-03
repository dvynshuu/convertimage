'use client';

import type { OutputFormat } from '@/lib/types';
import { OUTPUT_FORMATS } from '@/lib/types';
import { FORMAT_INFO } from '@/lib/constants';
import styles from './FormatSelector.module.css';

interface FormatSelectorProps {
  selected: OutputFormat;
  onChange: (format: OutputFormat) => void;
  avifSupported: boolean | null;
  disabledFormats?: OutputFormat[];
}

export function FormatSelector({
  selected,
  onChange,
  avifSupported,
  disabledFormats = [],
}: FormatSelectorProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Output format</legend>
      <div className={styles.grid} role="radiogroup" aria-label="Select output format">
        {OUTPUT_FORMATS.map((format) => {
          const info = FORMAT_INFO[format];
          const isDisabled = disabledFormats.includes(format) ||
            (format === 'avif' && avifSupported === false);
          const isSelected = selected === format;

          return (
            <button
              key={format}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`${styles.option} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
              onClick={() => !isDisabled && onChange(format)}
              disabled={isDisabled}
              aria-label={`Convert to ${info?.name || format.toUpperCase()}`}
            >
              <span className={styles.name}>{info?.name || format.toUpperCase()}</span>
              <span className={styles.meta}>
                {format === 'png' ? 'Lossless' : 'Lossy'}
                {info?.supportsTransparency ? ' · Alpha' : ''}
              </span>
              {format === 'avif' && avifSupported === false && (
                <span className={styles.badge}>Not supported</span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
