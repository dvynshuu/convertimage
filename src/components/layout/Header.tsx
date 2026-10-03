'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import { BRAND } from '@/lib/constants';
import styles from './Header.module.css';

export function Header() {
  const { resolved, mounted, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${BRAND.name} Home`}>
          <Image
            src="/icon.jpg"
            alt={`${BRAND.name} Logo`}
            width={32}
            height={32}
            className={styles.logoImage}
            priority
          />
          <span>{BRAND.name}</span>
          <span className={styles.brandBadge}>Free &amp; Private</span>
        </Link>

        <nav className={styles.nav} aria-label="Main Navigation">
          <Link href="/#formats" className={styles.navLink}>
            Formats
          </Link>
          <Link href="/#features" className={styles.navLink}>
            Why ConvertImage
          </Link>
          <Link href="/#faq" className={styles.navLink}>
            FAQ
          </Link>
          <Link href="/privacy" className={styles.navLink}>
            Privacy
          </Link>

          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={mounted ? `Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode` : 'Switch theme'}
            suppressHydrationWarning
          >
            {mounted && resolved === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
