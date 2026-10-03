'use client';

import { useRef, useCallback } from 'react';
import { useDragDrop } from '@/hooks/useDragDrop';
import { ACCEPT_STRING, COPY } from '@/lib/constants';
import styles from './UploadZone.module.css';

interface UploadZoneProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  formats?: string;
  className?: string;
}

export function UploadZone({
  onFileSelect,
  onFilesSelect,
  multiple = true,
  disabled = false,
  formats,
  className = '',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (files: File[]) => {
      if (disabled || files.length === 0) return;
      if (onFilesSelect) {
        onFilesSelect(files);
      } else if (onFileSelect) {
        onFileSelect(files[0]);
      }
    },
    [onFilesSelect, onFileSelect, disabled],
  );

  const { isDragging, dragHandlers } = useDragDrop(handleDrop);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      if (onFilesSelect) {
        onFilesSelect(fileList);
      } else if (onFileSelect) {
        onFileSelect(fileList[0]);
      }
      e.target.value = '';
    }
  };

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Upload images for conversion"
      {...dragHandlers}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple={multiple}
        onChange={handleChange}
        className={styles.input}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className={styles.content}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className={styles.primary}>
          {isDragging ? 'Drop images here' : COPY.upload.empty}
        </p>
        {!isDragging && (
          <p className={styles.secondary}>or choose files (single or batch)</p>
        )}
        <p className={styles.formats}>{formats || COPY.formats}</p>
      </div>
    </div>
  );
}
