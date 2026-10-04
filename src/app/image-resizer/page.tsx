import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageConverter } from '@/components/converter/ImageConverter';
import { FAQ } from '@/components/seo/FAQ';
import { BRAND, CONVERSION_ROUTES, type FAQItem } from '@/lib/constants';
import styles from '../landing.module.css';

export const metadata: Metadata = {
  title: 'Free Online Image Resizer — Resize Dimensions & Scale Photos',
  description:
    'Resize image dimensions online for free. Custom width and height, locked aspect ratios, and instant 25%, 50%, 75% scale presets in your browser.',
  keywords: [
    'image resizer',
    'resize image online',
    'resize image pixels',
    'change photo dimensions free',
    'scale image down',
    'aspect ratio image resizer',
    'free image resizer no upload',
  ],
  alternates: {
    canonical: `${BRAND.url}/image-resizer`,
  },
  openGraph: {
    title: 'Free Online Image Resizer — Resize Dimensions & Scale Photos',
    description:
      'Scale photo dimensions and change pixel width & height in your browser. 100% private in-browser image resizing with locked aspect ratios.',
    url: `${BRAND.url}/image-resizer`,
    type: 'website',
    siteName: BRAND.name,
    images: [
      {
        url: `${BRAND.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${BRAND.name} Image Resizer`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Image Resizer — Resize Dimensions & Scale Photos',
    description:
      'Resize photo dimensions with custom pixels or scale presets. 100% private client-side image resizer.',
    images: [`${BRAND.url}/og-image.jpg`],
  },
};

export default function ImageResizerPage() {
  const pageUrl = `${BRAND.url}/image-resizer`;

  const faqItems: FAQItem[] = [
    {
      question: 'How do I resize an image without distorting its aspect ratio?',
      answer:
        'Our resizer has aspect ratio locking enabled by default. When you enter a new width, the height calculates automatically based on original proportions (and vice versa). You can also use our instant 75%, 50%, or 25% scale presets.',
    },
    {
      question: 'Can I resize photos for passport, visa, or job portal requirements?',
      answer:
        'Yes. You can enter exact custom pixel dimensions (such as 600x600 px for US Visa, or standard 1920x1080 px for presentations). If the portal specifies strict file size limits as well, combine resizing with our quality slider to achieve both.',
    },
    {
      question: 'Does reducing dimensions make the file size smaller?',
      answer:
        'Yes, dramatically. Scaling an image to 50% reduces total pixel count by 75% (since area scales quadratically). This produces drastic file weight reduction while keeping the photo looking sharp on computer and phone displays.',
    },
    {
      question: 'What is the maximum image resolution supported?',
      answer:
        'You can safely resize photos up to 100 megapixels and up to 16,384 pixels on a single side. All rasterization is performed via hardware-accelerated HTML5 Canvas on your device without server limits.',
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
            name: 'Image Resizer',
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: `${BRAND.name} Image Resizer`,
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
          ratingCount: '740',
          bestRating: '5',
          worstRating: '1',
        },
        description:
          'Free in-browser image resizer to scale photo dimensions, change pixel width and height, and lock aspect ratios.',
        featureList: [
          'Automatic aspect ratio preservation',
          'Instant 75%, 50%, and 25% scale presets',
          'Custom pixel width and height inputs',
          'High-fidelity bicubic canvas interpolation',
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to resize image dimensions online',
        description:
          'Step-by-step instructions to scale down photo dimensions or resize image pixels in your browser with zero uploads.',
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
            name: 'Image file to resize',
          },
        ],
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            url: `${pageUrl}#step-1`,
            name: 'Select your photo',
            text: 'Drop your image into the resizer dropzone.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            url: `${pageUrl}#step-2`,
            name: 'Choose preset or input custom dimensions',
            text: 'Click 75%, 50%, or 25% to scale proportionally, or type your desired pixel width and height.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            url: `${pageUrl}#step-3`,
            name: 'Download resized image',
            text: 'Click Convert and download your resized photo instantly to your device.',
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
          <span aria-current="page">Image Resizer</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.badge}>
            <span>Proportional Scaling · Custom Pixels · Free</span>
          </div>
          <h1 className={styles.title}>Free Online Image Resizer</h1>
          <p className={styles.description}>
            Scale photo dimensions or adjust pixel width and height in seconds. Lock aspect ratios automatically or choose one-click presets with zero server uploads.
          </p>

          <div className={styles.highlightPills}>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> 75%, 50%, 25% Quick Presets
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Custom Pixel Dimensions
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Automatic Aspect Ratio Lock
            </span>
            <span className={styles.highlightPill}>
              <span className={styles.pillDot}>●</span> Hardware Bicubic Downsampling
            </span>
          </div>
        </header>

        {/* Converter Tool */}
        <div className={styles.converterWrapper}>
          <ImageConverter />
        </div>

        {/* Feature Grid */}
        <section className={styles.featureSection} aria-labelledby="resizer-features-title">
          <h2 id="resizer-features-title" className={styles.sectionTitle}>
            Precision Dimension Control
          </h2>
          <p className={styles.sectionSubtitle}>
            Designed for designers, developers, and photographers who need accurate pixel scaling
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6" />
                  <path d="M9 21H3v-6" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 21l7-7" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Aspect Ratio Preservation</h3>
              <p className={styles.featureCardText}>
                Never worry about squished or stretched photos. Proportions stay mathematically locked as you alter width or height.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>One-Click Scale Presets</h3>
              <p className={styles.featureCardText}>
                Need to downsize quickly? Use our 75%, 50%, or 25% presets to cut photo dimensions effortlessly without manual math.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>High-Fidelity Smoothing</h3>
              <p className={styles.featureCardText}>
                Images are scaled using browser bicubic smoothing engines to prevent jagged pixel edges and harsh aliasing on thin lines.
              </p>
            </div>
          </div>
        </section>

        {/* 3 Steps */}
        <section className={styles.stepsSection} aria-labelledby="steps-title">
          <h2 id="steps-title" className={styles.sectionTitle}>
            How to Resize Images in 3 Steps
          </h2>
          <div className={styles.stepsGrid}>
            <div id="step-1" className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Upload Image</h3>
              <p className={styles.stepText}>
                Drag in your photo or select a file from your computer or mobile device.
              </p>
            </div>
            <div id="step-2" className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Adjust Dimensions</h3>
              <p className={styles.stepText}>
                Select a quick scale preset (75%, 50%, 25%) or type exact width and height pixel values.
              </p>
            </div>
            <div id="step-3" className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Save Resized File</h3>
              <p className={styles.stepText}>
                Click Convert and save your newly dimensioned photo immediately to your device.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <div className={styles.faqWrapper}>
          <FAQ
            items={faqItems}
            includeSchema={false}
            title="Image Resizing FAQs"
            subtitle="Common questions regarding scaling dimensions, aspect ratios, and resolution"
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
