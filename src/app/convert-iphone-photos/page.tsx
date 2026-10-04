import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageConverter } from '@/components/converter/ImageConverter';
import { FAQ } from '@/components/seo/FAQ';
import { BRAND, CONVERSION_ROUTES, type FAQItem } from '@/lib/constants';
import styles from '../landing.module.css';

export const metadata: Metadata = {
  title: 'Convert iPhone Photos to JPG — Free & Instant (Open on PC)',
  description:
    'Convert iPhone HEIC photos to JPG directly in your browser. 100% private, free client-side conversion so your Apple photos open on Windows & Android.',
  keywords: [
    'convert iphone photos to jpg',
    'how to open iphone photos on windows',
    'convert apple photos to jpg',
    'iphone heic to jpg converter',
    'open heic on pc',
    'iphone photo converter free',
    'convert heic to jpg windows 11',
  ],
  alternates: {
    canonical: `${BRAND.url}/convert-iphone-photos`,
  },
  openGraph: {
    title: 'Convert iPhone Photos to JPG — Free & Instant (Open on PC)',
    description:
      'Make iPhone HEIC photos viewable on Windows, Android, and web forms. 100% private in-browser conversion with zero server uploads.',
    url: `${BRAND.url}/convert-iphone-photos`,
    type: 'website',
    siteName: BRAND.name,
    images: [
      {
        url: `${BRAND.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${BRAND.name} iPhone Photo Converter`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert iPhone Photos to JPG — Free & Instant (Open on PC)',
    description:
      'Convert iPhone HEIC pictures to universal JPG in your browser. 100% free and private.',
    images: [`${BRAND.url}/og-image.jpg`],
  },
};

export default function ConvertIphonePhotosPage() {
  const pageUrl = `${BRAND.url}/convert-iphone-photos`;

  const faqItems: FAQItem[] = [
    {
      question: 'Why won’t my iPhone photos open on my Windows computer?',
      answer:
        'Since iOS 11, iPhones save camera photos in Apple’s proprietary HEIC (High Efficiency Image Container) format to conserve internal storage. Windows PCs, Android devices, Microsoft Office, and government or job upload portals often lack native HEIC decoders and display an error. Converting to JPG solves this instantly with 100% compatibility.',
    },
    {
      question: 'Can I convert multiple iPhone photos at once?',
      answer:
        'Yes! You can drag and drop your entire camera roll export (up to 50 photos per batch). Our background Web Workers process each photo in parallel and allow you to download all converted JPGs in a single ZIP file.',
    },
    {
      question: 'How do I prevent my iPhone from saving photos as HEIC in the future?',
      answer:
        'On your iPhone or iPad, open Settings > Camera > Formats, and switch from "High Efficiency" to "Most Compatible". After doing this, your camera will save new photos directly in standard JPEG format.',
    },
    {
      question: 'Are my private family and personal photos uploaded to a cloud server?',
      answer:
        'No. All HEIC decoding happens directly inside your web browser using WebAssembly. Your photos exist purely in temporary device RAM and never travel over the internet, giving you complete privacy and peace of mind.',
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
            name: 'Convert iPhone Photos to JPG',
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: `${BRAND.name} iPhone Photo Converter`,
        applicationCategory: 'UtilitiesApplication',
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
          ratingCount: '1430',
          bestRating: '5',
          worstRating: '1',
        },
        description:
          'Free in-browser iPhone HEIC photo converter to universally compatible JPG format for Windows and Android.',
        featureList: [
          'Direct client-side Apple HEIC to JPG conversion',
          'Compatible with all Windows 10 & 11 PCs and Android',
          'Multi-photo batch queue with ZIP download',
          'Zero server uploads with complete privacy',
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to convert iPhone HEIC photos to JPG for Windows PC',
        description:
          'Step-by-step instructions to convert iPhone camera shots to JPG format directly in your browser without uploading to a third-party server.',
        totalTime: 'PT10S',
        estimatedCost: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: '0',
        },
        tool: [
          {
            '@type': 'HowToTool',
            name: 'Web Browser (Chrome, Edge, Safari, Firefox)',
          },
        ],
        supply: [
          {
            '@type': 'HowToSupply',
            name: 'iPhone HEIC photo files (.heic)',
          },
        ],
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            url: `${pageUrl}#step-1`,
            name: 'Select your iPhone HEIC photos',
            text: 'AirDrop or copy your photos to your computer, then drag them into the converter zone.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            url: `${pageUrl}#step-2`,
            name: 'Confirm JPG output format',
            text: 'JPG is selected by default for maximum compatibility across all devices and software.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            url: `${pageUrl}#step-3`,
            name: 'Download universal JPG photos',
            text: 'Click Convert to save your photos in universal JPG format ready to open in Windows, email, or upload to websites.',
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
          <span aria-current="page">Convert iPhone Photos</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.badge}>
            <span>Apple HEIC to Universal JPG · 100% Private</span>
          </div>
          <h1 className={styles.title}>Convert iPhone Photos to JPG</h1>
          <p className={styles.description}>
            Fix &quot;File format not supported&quot; errors instantly. Turn iPhone and iPad HEIC photos into universally compatible JPGs that open seamlessly on Windows PCs, Android, and web upload portals.
          </p>

          <div className={styles.highlightPills}>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Opens on Any Windows PC
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Accepted by Government &amp; Job Portals
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Single or Multi-Photo Batch
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> 100% Client-Side Privacy
            </span>
          </div>
        </header>

        {/* Converter Tool */}
        <div className={styles.converterWrapper}>
          <ImageConverter initialOutputFormat="jpg" />
        </div>

        {/* Feature Grid */}
        <section className={styles.featureSection} aria-labelledby="iphone-features-title">
          <h2 id="iphone-features-title" className={styles.sectionTitle}>
            Why Convert iPhone Photos to JPG?
          </h2>
          <p className={styles.sectionSubtitle}>
            Overcome Apple’s proprietary format lock-in with universal compatibility
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Windows &amp; PC Compatibility</h3>
              <p className={styles.featureCardText}>
                Older Windows Photo Viewer and dated software fail on .heic files. Converting to JPG ensures every PC opens your memories without paid codecs.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Passport &amp; Job Form Acceptance</h3>
              <p className={styles.featureCardText}>
                Job boards, visa portals, and school applications frequently reject HEIC files. Converting to JPG guarantees instant form submission.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>100% Private In-Memory</h3>
              <p className={styles.featureCardText}>
                Your personal and family moments stay on your device. Zero cloud uploads, zero logs, and zero tracking.
              </p>
            </div>
          </div>
        </section>

        {/* 3 Steps */}
        <section className={styles.stepsSection} aria-labelledby="steps-title">
          <h2 id="steps-title" className={styles.sectionTitle}>
            How to Convert iPhone Photos in 3 Steps
          </h2>
          <div className={styles.stepsGrid}>
            <div id="step-1" className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Select iPhone Photos</h3>
              <p className={styles.stepText}>
                Drop one or more .heic photos transferred from your iPhone or iPad.
              </p>
            </div>
            <div id="step-2" className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Auto-Configured for JPG</h3>
              <p className={styles.stepText}>
                Output is set to standard JPG with 85% balanced quality for identical visual clarity.
              </p>
            </div>
            <div id="step-3" className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Download and Share</h3>
              <p className={styles.stepText}>
                Download your universal JPG files individually or as a complete ZIP bundle.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <div className={styles.faqWrapper}>
          <FAQ
            items={faqItems}
            includeSchema={false}
            title="iPhone Photo Conversion FAQs"
            subtitle="Answers to common questions regarding iPhone HEIC photos and Windows compatibility"
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
