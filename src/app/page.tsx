import Link from 'next/link';
import { ImageConverter } from '@/components/converter/ImageConverter';
import { FormatGuide } from '@/components/seo/FormatGuide';
import { Features } from '@/components/seo/Features';
import { FAQ } from '@/components/seo/FAQ';
import { CONVERSION_ROUTES, BRAND } from '@/lib/constants';
import styles from './page.module.css';

export default function HomePage() {
  const popularRoutes = CONVERSION_ROUTES.slice(0, 4);

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND.name,
    url: BRAND.url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: BRAND.description,
    featureList: [
      'Client-side image conversion',
      'JPG, PNG, WebP, AVIF, HEIC support',
      'Lossless and lossy compression control',
      'Aspect ratio resizing',
      'No file uploads or server storage',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        suppressHydrationWarning
      />

      <section className={styles.hero}>
        <h1 className={styles.title}>Convert images directly in your browser.</h1>
        <p className={styles.subtitle}>
          High-performance, private in-memory conversion across JPG, PNG, WebP, AVIF, and Apple HEIC.
          Your files never touch a server.
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
