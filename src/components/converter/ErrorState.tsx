'use client';

import type { ConversionError } from '@/lib/types';
import { COPY } from '@/lib/constants';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  error: ConversionError;
  onRetry?: () => void;
  onReset: () => void;
}

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  return (
    <div className={styles.container} role="alert" aria-live="assertive">
      <div className={styles.icon} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3 className={styles.title}>Conversion Failed</h3>
      <p className={styles.message}>{error.userMessage || COPY.errors.generic}</p>

      {error.recoveryAction && (
        <p className={styles.recovery}>{error.recoveryAction}</p>
      )}

      <div className={styles.actions}>
        {onRetry && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={onRetry}
          >
            {COPY.errors.retry}
          </button>
        )}
        <button
          type="button"
          className={styles.resetButton}
          onClick={onReset}
        >
          {COPY.errors.tryAnother}
        </button>
      </div>

      {error.technicalDetails && (
        <details className={styles.details}>
          <summary>Technical details</summary>
          <code>{error.technicalDetails}</code>
        </details>
      )}
    </div>
  );
}
