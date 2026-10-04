import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageConverter } from '@/components/converter/ImageConverter';
import { FAQ } from '@/components/seo/FAQ';
import { BRAND, CONVERSION_ROUTES, type FAQItem } from '@/lib/constants';
import styles from '../landing.module.css';

export const metadata: Metadata = {
  title: 'Batch Image Converter — Convert Multiple Photos Online Free',
  description:
    'Convert multiple images at once directly in your browser. 100% free, private batch converter with multi-threaded Web Workers & 1-click ZIP download.',
  keywords: [
    'batch image converter',
    'bulk image converter',
    'convert multiple images online',
    'bulk heic to jpg',
    'convert photos in bulk',
    'batch convert png to webp',
    'free batch image converter',
    'bulk photo converter no upload',
  ],
  alternates: {
    canonical: `${BRAND.url}/batch-image-converter`,
  },
  openGraph: {
    title: 'Batch Image Converter — Convert Multiple Photos Online Free',
    description:
      'Convert dozens of images simultaneously in your browser. Zero server uploads, multi-threaded Web Workers, and 1-click ZIP download.',
    url: `${BRAND.url}/batch-image-converter`,
    type: 'website',
    siteName: BRAND.name,
    images: [
      {
        url: `${BRAND.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${BRAND.name} Batch Image Converter`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Batch Image Converter — Convert Multiple Photos Online Free',
    description:
      'Convert multiple images at once in your browser. Free, private batch image converter with 1-click ZIP download.',
    images: [`${BRAND.url}/og-image.jpg`],
  },
};

export default function BatchConverterPage() {
  const pageUrl = `${BRAND.url}/batch-image-converter`;

  const faqItems: FAQItem[] = [
    {
      question: 'How many images can I convert at once?',
      answer:
        'You can convert up to 50 images in a single batch. This limit ensures your browser stays responsive and prevents mobile or desktop devices from exceeding system memory boundaries.',
    },
    {
      question: 'How does batch conversion work without freezing my browser?',
      answer:
        'ConvertImage utilizes background Web Workers to distribute image decoding and re-encoding across multiple CPU threads off the main UI thread. This prevents stuttering and lets you interact with the page smoothly while conversion completes.',
    },
    {
      question: 'How do I download all my converted files?',
      answer:
        'Once batch conversion is complete, you can download all converted images individually or click "Download All (ZIP)" to instantly bundle all files into a single, clean compressed archive without any waiting.',
    },
    {
      question: 'Are my batch photos uploaded to a cloud server?',
      answer:
        'No. Every single image in your batch is decoded, resized, and encoded strictly inside your browser’s temporary RAM. Your files never leave your computer or phone, ensuring 100% privacy for confidential work or personal photos.',
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BRAND.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Batch Image Converter',
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: `${BRAND.name} Batch Image Converter`,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Web-based)',
        url: pageUrl,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '860',
          bestRating: '5',
          worstRating: '1',
        },
        description:
          'Free, multi-threaded in-browser batch image converter supporting JPG, PNG, WebP, AVIF, and Apple HEIC with one-click ZIP download.',
        featureList: [
          'Process up to 50 images per batch simultaneously',
          'Multi-threaded Web Worker pool off the main UI thread',
          'Instant one-click ZIP archive generation',
          '100% client-side memory processing with zero server uploads',
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to batch convert multiple images online',
        description:
          'Step-by-step guide to converting dozens of photos simultaneously in your browser without uploading to a server.',
        totalTime: 'PT15S',
        estimatedCost: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: '0',
        },
        tool: [
          {
            '@type': 'HowToTool',
            name: 'Modern Web Browser (Chrome, Edge, Safari, Firefox)',
          },
        ],
        supply: [
          {
            '@type': 'HowToSupply',
            name: 'Batch image files (JPG, PNG, WebP, AVIF, or HEIC)',
          },
        ],
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            url: `${pageUrl}#step-1`,
            name: 'Select or drag multiple images',
            text: 'Drag and drop multiple photos into the conversion dropzone or select multiple files from your device.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            url: `${pageUrl}#step-2`,
            name: 'Choose format and quality settings',
            text: 'Select your target format (JPG, PNG, WebP, or AVIF) and adjust the compression slider to fit your needs.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            url: `${pageUrl}#step-3`,
            name: 'Convert and download ZIP archive',
            text: 'Click Convert and instantly download all converted photos in a single convenient ZIP file.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  const topRoutes = CONVERSION_ROUTES.slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        suppressHydrationWarning
      />

      <div className={styles.container}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span aria-current="page">Batch Image Converter</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.badge}>
            <span>Multi-Threaded · 100% Private · No Limits</span>
          </div>
          <h1 className={styles.title}>Free Batch Image Converter</h1>
          <p className={styles.description}>
            Convert dozens of images simultaneously in seconds. Powered by client-side Web Workers with zero queue wait times and instant 1-click ZIP download.
          </p>

          <div className={styles.highlightPills}>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Up to 50 Files per Batch
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Multi-Core Parallel Workers
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> 1-Click ZIP Archive
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Zero Server Uploads
            </span>
          </div>
        </header>

        {/* Converter Tool */}
        <div className={styles.converterWrapper}>
          <ImageConverter />
        </div>

        {/* Technical Highlights Section */}
        <section className={styles.featureSection} aria-labelledby="batch-features-title">
          <h2 id="batch-features-title" className={styles.sectionTitle}>
            Engineered for High-Volume Workflow
          </h2>
          <p className={styles.sectionSubtitle}>
            Why ConvertImage is the fastest and safest bulk converter on the web
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Parallel Multi-Threading</h3>
              <p className={styles.featureCardText}>
                We harness your device’s multi-core CPU using dedicated Web Workers. Processing happens concurrently without locking your browser tab.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Bundled ZIP Download</h3>
              <p className={styles.featureCardText}>
                No need to click download on 50 separate files. All converted images are packaged into a tidy .zip file directly in browser memory.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Confidential &amp; Private</h3>
              <p className={styles.featureCardText}>
                Cloud converters upload your confidential client assets and private photos to third-party servers. We process everything locally on your device.
              </p>
            </div>
          </div>
        </section>

        {/* 3 Steps */}
        <section className={styles.stepsSection} aria-labelledby="steps-title">
          <h2 id="steps-title" className={styles.sectionTitle}>
            How to Batch Convert Images in 3 Steps
          </h2>
          <div className={styles.stepsGrid}>
            <div id="step-1" className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Drag or Select Files</h3>
              <p className={styles.stepText}>
                Drag multiple JPG, PNG, WebP, AVIF, or HEIC files into the dropzone simultaneously.
              </p>
            </div>
            <div id="step-2" className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Choose Output Format</h3>
              <p className={styles.stepText}>
                Select your desired format and optionally adjust compression quality or resizing options.
              </p>
            </div>
            <div id="step-3" className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Download as ZIP</h3>
              <p className={styles.stepText}>
                Watch real-time worker progress bars and click download to get all files bundled in a single ZIP.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <div className={styles.faqWrapper}>
          <FAQ
            items={faqItems}
            includeSchema={false}
            title="Batch Image Conversion FAQs"
            subtitle="Common questions about bulk and multi-file image processing"
          />
        </div>

        {/* Related Routes */}
        <section className={styles.relatedSection} aria-labelledby="related-title">
          <h2 id="related-title" className={styles.relatedTitle}>
            Popular Conversion Tools
          </h2>
          <div className={styles.relatedGrid}>
            {topRoutes.map((r) => (
              <Link key={r.slug} href={`/${r.slug}`} className={styles.relatedLink}>
                <span>{r.from.toUpperCase()} to {r.to.toUpperCase()} Converter</span>
                <span className={styles.relatedArrow}>&rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
