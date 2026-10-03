'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BRAND, CONVERSION_ROUTES } from '@/lib/constants';
import styles from './Footer.module.css';

export function Footer() {
  // Show popular routes in footer
  const popularRoutes = CONVERSION_ROUTES.slice(0, 6);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <div className={styles.brandTitleRow}>
              <Image
                src="/icon.jpg"
                alt={`${BRAND.name} Logo`}
                width={28}
                height={28}
                className={styles.footerLogo}
              />
              <span className={styles.brandName}>{BRAND.name}</span>
            </div>
            <p className={styles.brandDesc}>
              High-performance, private in-browser image conversion. No file uploads, no server processing, no data tracking.
            </p>
            <div className={styles.privacyBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>100% Client-Side Processing</span>
            </div>
          </div>

          <div className={styles.navCol}>
            <span className={styles.colTitle}>Popular Tools</span>
            <ul className={styles.linkList}>
              {popularRoutes.map((route) => (
                <li key={route.slug}>
                  <Link href={`/${route.slug}`} className={styles.link}>
                    {route.from.toUpperCase()} to {route.to.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.navCol}>
            <span className={styles.colTitle}>Legal & Info</span>
            <ul className={styles.linkList}>
              <li>
                <Link href="/privacy" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.link}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/#faq" className={styles.link}>
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/#formats" className={styles.link}>
                  Supported Formats
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
          <span>Zero logs · Zero tracking · Zero servers</span>
        </div>
      </div>
    </footer>
  );
}
