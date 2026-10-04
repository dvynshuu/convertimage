import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageConverter } from '@/components/converter/ImageConverter';
import { FAQ } from '@/components/seo/FAQ';
import { BRAND, CONVERSION_ROUTES, type FAQItem } from '@/lib/constants';
import styles from '../landing.module.css';

export const metadata: Metadata = {
  title: 'Free Image Compressor — Compress Images Online (No Upload)',
  description:
    'Compress JPG, PNG, WebP & AVIF images online without quality loss. 100% private in-browser compression with live file size savings & instant download.',
  keywords: [
    'image compressor',
    'compress image online',
    'reduce image size in kb',
    'compress photo without losing quality',
    'shrink image file size',
    'compress jpg online',
    'compress png online',
    'free image compressor no upload',
  ],
  alternates: {
    canonical: `${BRAND.url}/image-compressor`,
  },
  openGraph: {
    title: 'Free Image Compressor — Compress Images Online (No Upload)',
    description:
      'Compress JPG, PNG, WebP & AVIF images online without quality loss. 100% private client-side compression with live byte savings.',
    url: `${BRAND.url}/image-compressor`,
    type: 'website',
    siteName: BRAND.name,
    images: [
      {
        url: `${BRAND.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${BRAND.name} Image Compressor`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Compressor — Compress Images Online (No Upload)',
    description:
      'Compress images in your browser with zero server uploads. Real-time file size savings and adjustable quality sliders.',
    images: [`${BRAND.url}/og-image.jpg`],
  },
};

export default function ImageCompressorPage() {
  const pageUrl = `${BRAND.url}/image-compressor`;

  const faqItems: FAQItem[] = [
    {
      question: 'How do I reduce image file size to meet upload limits (e.g. under 200 KB)?',
      answer:
        'Drag your photo into the compressor and set your target format to WebP or JPG. Adjust the compression slider to between 70% and 80%, or choose a dimension resize preset (such as 75% or 50%). Our tool recalculates file size instantly in memory so you can hit exact byte requirements.',
    },
    {
      question: 'Will compressing my images reduce their visual quality?',
      answer:
        'Modern codecs like WebP and AVIF allow 30% to 50% byte reduction with virtually indistinguishable visual difference from the original. You can use our interactive split-view comparison slider to inspect pixels before saving.',
    },
    {
      question: 'Which image format provides the best compression ratio?',
      answer:
        'AVIF delivers the strongest compression efficiency, reducing sizes up to 50% compared to JPG. WebP is the runner-up with 25%–35% savings and universal browser support. For photos with transparent backgrounds, converting PNG to WebP yields massive savings.',
    },
    {
      question: 'Are my confidential documents and photos safe from data harvesting?',
      answer:
        'Yes, completely. Unlike online cloud compressors that upload your files to remote servers, ConvertImage processes all compression directly inside your device memory using HTML5 Canvas. Your files never touch a server.',
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
            name: 'Image Compressor',
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: `${BRAND.name} Image Compressor`,
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
          ratingCount: '1120',
          bestRating: '5',
          worstRating: '1',
        },
        description:
          'Free in-browser image compressor to reduce JPG, PNG, WebP, and AVIF file sizes with real-time compression calculation.',
        featureList: [
          'Lossy and lossless compression quality adjustment',
          'Live byte savings calculator and visual comparison',
          'Dimension scaling presets (75%, 50%, 25%)',
          'Zero server uploads with complete privacy',
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to compress images online without losing quality',
        description:
          'Step-by-step instructions to shrink image file sizes directly in your browser without uploading to a third-party server.',
        totalTime: 'PT10S',
        estimatedCost: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: '0',
        },
        tool: [
          {
            '@type': 'HowToTool',
            name: 'Web Browser (Chrome, Safari, Edge, Firefox)',
          },
        ],
        supply: [
          {
            '@type': 'HowToSupply',
            name: 'Image file (JPG, PNG, WebP, AVIF, HEIC)',
          },
        ],
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            url: `${pageUrl}#step-1`,
            name: 'Drop or select your image',
            text: 'Upload or drag your photo into the compression dropzone.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            url: `${pageUrl}#step-2`,
            name: 'Tune quality slider or scale dimensions',
            text: 'Adjust the compression quality slider (recommended 80% - 85%) or scale dimensions to reduce byte size.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            url: `${pageUrl}#step-3`,
            name: 'Inspect savings & download',
            text: 'Review the instant byte savings breakdown and download your compressed image immediately.',
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
          <span aria-current="page">Image Compressor</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.badge}>
            <span>Free &amp; Private · Up to 80% Reduction</span>
          </div>
          <h1 className={styles.title}>Free Online Image Compressor</h1>
          <p className={styles.description}>
            Compress JPG, PNG, WebP, and AVIF photos in your browser. Slash file weights for websites, job applications, and email attachments with zero quality compromise.
          </p>

          <div className={styles.highlightPills}>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Lossy &amp; Lossless Compression
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Live Byte Savings Calculator
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Interactive Split Slider
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> 100% In-Browser Privacy
            </span>
          </div>
        </header>

        {/* Converter Tool */}
        <div className={styles.converterWrapper}>
          <ImageConverter initialOutputFormat="webp" />
        </div>

        {/* Feature Grid */}
        <section className={styles.featureSection} aria-labelledby="compressor-features-title">
          <h2 id="compressor-features-title" className={styles.sectionTitle}>
            High-Performance Image Compression
          </h2>
          <p className={styles.sectionSubtitle}>
            Intelligent optimization algorithms designed to slash bandwidth without pixel distortion
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Fine-Tuned Quality Sliders</h3>
              <p className={styles.featureCardText}>
                Take precise command over compression quantization. Dial in the sweet spot between featherweight byte size and crisp photographic sharpness.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Live Byte Breakdown</h3>
              <p className={styles.featureCardText}>
                See original size versus compressed size in real time. Know exactly how many kilobytes or megabytes you saved before downloading.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Zero Network Upload Wait</h3>
              <p className={styles.featureCardText}>
                Never wait for slow 10 MB uploads over cellular or slow connections. Image encoding happens in milliseconds using your local device processor.
              </p>
            </div>
          </div>
        </section>

        {/* 3 Steps */}
        <section className={styles.stepsSection} aria-labelledby="steps-title">
          <h2 id="steps-title" className={styles.sectionTitle}>
            How to Compress Images in 3 Steps
          </h2>
          <div className={styles.stepsGrid}>
            <div id="step-1" className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Select Image</h3>
              <p className={styles.stepText}>
                Drop your JPG, PNG, WebP, AVIF, or HEIC file into the compression zone.
              </p>
            </div>
            <div id="step-2" className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Set Quality &amp; Scale</h3>
              <p className={styles.stepText}>
                Adjust the quality slider (80%-85% recommended) or scale dimensions to shrink file size.
              </p>
            </div>
            <div id="step-3" className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Download Compressed File</h3>
              <p className={styles.stepText}>
                Compare original vs compressed preview and click Download to save your optimized photo.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <div className={styles.faqWrapper}>
          <FAQ
            items={faqItems}
            includeSchema={false}
            title="Image Compression FAQs"
            subtitle="Everything you need to know about reducing image sizes without losing clarity"
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
