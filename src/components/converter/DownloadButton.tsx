'use client';

import styles from './DownloadButton.module.css';

interface DownloadButtonProps {
  onClick: () => void;
  filename: string;
  fileSize?: string;
  disabled?: boolean;
  className?: string;
}

export function DownloadButton({
  onClick,
  filename,
  fileSize,
  disabled = false,
  className = '',
}: DownloadButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Download ${filename}${fileSize ? ` (${fileSize})` : ''}`}
    >
      <span className={styles.icon} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
      <span>Download</span>
      {fileSize && <span className={styles.meta}>({fileSize})</span>}
    </button>
  );
}
