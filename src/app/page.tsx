import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageConverter } from '@/components/converter/ImageConverter';
import { FormatGuide } from '@/components/seo/FormatGuide';
import { Features } from '@/components/seo/Features';
import { FAQ } from '@/components/seo/FAQ';
import { CONVERSION_ROUTES, BRAND } from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Free Online Image Converter — Convert JPG, PNG, WebP, AVIF, HEIC',
  description:
    'Convert JPG, PNG, WebP, AVIF, and Apple HEIC images directly in your browser. 100% private, free, and instant client-side conversion. No uploads, no watermarks, no signups.',
  alternates: {
    canonical: BRAND.url,
  },
  openGraph: {
    title: 'Free Online Image Converter — Convert JPG, PNG, WebP, AVIF, HEIC',
    description:
      'Convert JPG, PNG, WebP, AVIF, and Apple HEIC images directly in your browser. 100% private, free, and instant client-side conversion.',
    url: BRAND.url,
    siteName: BRAND.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ConvertImage — Free In-Browser Image Converter',
      },
    ],
  },
};

export default function HomePage() {
  const popularRoutes = CONVERSION_ROUTES.slice(0, 5);

  // Group conversion routes for categorized internal linking
  const categories = [
    {
      title: 'iPhone & Apple HEIC',
      routes: CONVERSION_ROUTES.filter((r) => r.from === 'heic'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
    {
      title: 'Web Performance (WebP & AVIF)',
      routes: CONVERSION_ROUTES.filter((r) => r.to === 'webp' || r.to === 'avif'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      title: 'Universal Formats (JPG & PNG)',
      routes: CONVERSION_ROUTES.filter((r) => (r.to === 'jpg' || r.to === 'png') && r.from !== 'heic'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
  ];

  const structuredDataGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BRAND.url}/#website`,
        url: BRAND.url,
        name: BRAND.name,
        description: BRAND.description,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': `${BRAND.url}/#organization`,
        name: BRAND.name,
        url: BRAND.url,
        logo: {
          '@type': 'ImageObject',
          url: `${BRAND.url}/icon-512.png`,
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${BRAND.url}/#webapp`,
        name: BRAND.name,
        url: BRAND.url,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires HTML5 Canvas and WebAssembly capable browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Free, high-performance, client-side browser image converter supporting JPG, PNG, WebP, AVIF, and Apple HEIC with zero server uploads.',
        featureList: [
          'Client-side image conversion with zero server uploads',
          'Support for JPG, PNG, WebP, AVIF, and Apple HEIC',
          'Fine-tuned lossy and lossless compression quality control',
          'Aspect ratio constrained resizing presets (75%, 50%, 25%, Custom)',
          'Complete browser memory isolation with zero tracking',
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataGraph) }}
        suppressHydrationWarning
      />

      <section className={styles.hero}>
        <h1 className={styles.title}>Free Online Image Converter</h1>
        <p className={styles.subtitle}>
          High-performance, private in-memory conversion across JPG, PNG, WebP, AVIF, and Apple HEIC.
          Zero file uploads — your photos never leave your device.
        </p>

        <div className={styles.converterWrapper}>
          <ImageConverter />
        </div>

        <div className={styles.quickLinks}>
          <span>Popular:</span>
          {popularRoutes.map((route) => (
            <Link key={route.slug} href={`/${route.slug}`} className={styles.quickLinkItem}>
              {route.from.toUpperCase()} to {route.to.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      <div className={styles.contentWrapper}>
        <div className="container">
          <FormatGuide />
        </div>

        {/* SEO Conversion Directory */}
        <div className="container">
          <section className={styles.directorySection} aria-labelledby="directory-title">
            <div className={styles.directoryHeader}>
              <h2 id="directory-title" className={styles.directoryTitle}>
                All Image Conversion Tools
              </h2>
              <p className={styles.directorySubtitle}>
                Dedicated, high-speed conversion pathways for every major photo and graphics format
              </p>
            </div>

            <div className={styles.directoryGrid}>
              {categories.map((cat, idx) => (
                <div key={idx} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryIcon} aria-hidden="true">
                      {cat.icon}
                    </div>
                    <h3 className={styles.categoryTitle}>{cat.title}</h3>
                  </div>

                  <ul className={styles.categoryList}>
                    {cat.routes.map((route) => (
                      <li key={route.slug}>
                        <Link href={`/${route.slug}`} className={styles.categoryLink}>
                          <span>{route.from.toUpperCase()} to {route.to.toUpperCase()} Converter</span>
                          <span>&rarr;</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="container">
          <Features />
        </div>

        <div className="container">
          <FAQ />
        </div>
      </div>
    </>
  );
}
