'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDragDropReturn {
  isDragging: boolean;
  dragHandlers: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

export function useDragDrop(
  onFilesDrop: (files: File[]) => void,
): UseDragDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFilesDrop(Array.from(files));
      }
    },
    [onFilesDrop],
  );

  return {
    isDragging,
    dragHandlers: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
    },
  };
}

/**
 * Hook for global page-level drag events (prevents browser default behavior).
 */
export function usePageDragPrevention(): void {
  useEffect(() => {
    const handler = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', handler);
    window.addEventListener('drop', handler);
    return () => {
      window.removeEventListener('dragover', handler);
      window.removeEventListener('drop', handler);
    };
  }, []);
}
