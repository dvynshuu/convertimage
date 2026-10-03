'use client';

import { useSyncExternalStore, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    return (localStorage.getItem('theme') as Theme) || 'system';
  } catch {
    return 'system';
  }
}

const themeListeners = new Set<() => void>();

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);

  const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const onMediaChange = () => callback();
  mql?.addEventListener('change', onMediaChange);

  const onStorageChange = (e: StorageEvent) => {
    if (e.key === 'theme') callback();
  };
  window?.addEventListener('storage', onStorageChange);

  return () => {
    themeListeners.delete(callback);
    mql?.removeEventListener('change', onMediaChange);
    window?.removeEventListener('storage', onStorageChange);
  };
}

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

const emptySubscribe = () => () => {};

export function useTheme() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const theme = useSyncExternalStore(
    subscribeTheme,
    getStoredTheme,
    () => 'system' as Theme
  );

  const resolved: 'light' | 'dark' = theme === 'system' ? getSystemTheme() : theme;

  // Apply data-theme attribute to html root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolved);
    }
  }, [resolved]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // ignore storage failure in private mode
    }
    const nextResolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    document.documentElement.setAttribute('data-theme', nextResolved);
    notifyThemeListeners();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolved, setTheme]);

  return { theme, resolved, mounted, setTheme, toggleTheme };
}
