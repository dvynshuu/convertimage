import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ImageConverter } from '@/components/converter/ImageConverter';
import { FAQ } from '@/components/seo/FAQ';
import { CONVERSION_ROUTES, BRAND, FORMAT_INFO, type FAQItem } from '@/lib/constants';
import styles from './conversion.module.css';

interface Props {
  params: Promise<{ conversion: string }>;
}

export async function generateStaticParams() {
  return CONVERSION_ROUTES.map((route) => ({
    conversion: route.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { conversion } = await params;
  const route = CONVERSION_ROUTES.find((r) => r.slug === conversion);

  if (!route) {
    return {
      title: 'Conversion Not Found',
    };
  }

  const fromUpper = route.from.toUpperCase();
  const toUpper = route.to.toUpperCase();
  const title = `Convert ${fromUpper} to ${toUpper} Online (Free & Fast)`;
  const description = `${route.description} 100% private, client-side in-browser conversion with zero server uploads.`;
  const url = `${BRAND.url}/${route.slug}`;

  return {
    title,
    description,
    keywords: [
      `convert ${route.from} to ${route.to}`,
      `${route.from} to ${route.to}`,
      `free ${route.from} to ${route.to} converter`,
      `${route.from} to ${route.to} online`,
      `batch ${route.from} to ${route.to}`,
      `client side image converter`,
      `private image converter`,
      `fast image converter`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: BRAND.name,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Convert ${fromUpper} to ${toUpper} — ${BRAND.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function ConversionPage({ params }: Props) {
  const { conversion } = await params;
  const route = CONVERSION_ROUTES.find((r) => r.slug === conversion);

  if (!route) {
    notFound();
  }

  const fromInfo = FORMAT_INFO[route.from];
  const toInfo = FORMAT_INFO[route.to];
  const fromUpper = route.from.toUpperCase();
  const toUpper = route.to.toUpperCase();
  const pageUrl = `${BRAND.url}/${route.slug}`;

  // Structured Data Graph: BreadcrumbList + SoftwareApplication + HowTo
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
            name: `${fromUpper} to ${toUpper} Converter`,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: `${BRAND.name} ${fromUpper} to ${toUpper} Converter`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All (Web-based)',
        url: pageUrl,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: route.description,
        featureList: [
          `In-browser client-side ${fromUpper} to ${toUpper} conversion`,
          'Zero server uploads — 100% private',
          'Adjustable compression quality and dimensions',
          'Instant batch file downloading',
        ],
      },
      {
        '@type': 'HowTo',
        name: `How to convert ${fromUpper} to ${toUpper} online`,
        description: `Fast, step-by-step instructions for converting ${fromUpper} images to ${toUpper} format directly in your web browser.`,
        totalTime: 'PT10S',
        estimatedCost: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: '0',
        },
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: `Upload or drag your ${fromUpper} image`,
            text: `Select one or more ${fromUpper} files from your device or drag and drop them into the conversion zone.`,
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Tune quality or resize (Optional)',
            text: `Adjust the compression quality slider or choose a dimension resize preset to optimize file weight.`,
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: `Download your ${toUpper} file`,
            text: `Click Convert and download your newly created ${toUpper} image instantly to your local drive.`,
          },
        ],
      },
    ],
  };

  const relatedRoutes = CONVERSION_ROUTES.filter(
    (r) => r.slug !== route.slug && (r.from === route.from || r.to === route.to)
  ).slice(0, 6);

  const customFaq: FAQItem[] = [
    {
      question: `How do I convert ${fromUpper} to ${toUpper} without uploading to a server?`,
      answer: `Our converter runs entirely inside your web browser using HTML5 Canvas and WebAssembly. When you drag in your ${fromUpper} file, your device processor decodes the pixels and generates the ${toUpper} file in temporary local memory. Your image never travels over the internet.`,
    },
    {
      question: `Will converting from ${fromUpper} to ${toUpper} reduce image quality?`,
      answer: route.to === 'png'
        ? `No. PNG is a lossless format, so converting your ${fromUpper} to PNG creates an uncompressed, pixel-perfect copy without compression artifacts.`
        : `Converting to ${toUpper} uses lossy compression. You can use our quality slider (set to 85% by default) to achieve the exact balance of sharp visual quality and lightweight file size you need.`,
    },
    {
      question: `Why choose this ${fromUpper} to ${toUpper} converter over cloud tools?`,
      answer: `Most online tools upload your confidential photos to remote cloud servers, exposing you to privacy risks, queue wait times, and file size limits. ConvertImage processes everything locally in milliseconds with zero uploads, no watermarks, and complete privacy.`,
    },
    {
      question: `Can I batch convert multiple ${fromUpper} files to ${toUpper}?`,
      answer: `Yes! You can drag and drop multiple ${fromUpper} files at once. The converter queues and processes each image through background Web Workers for smooth multitasking without freezing your browser.`,
    },
  ];

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
          <span aria-current="page">{fromUpper} to {toUpper}</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.badge}>
            <span>{fromUpper} &rarr; {toUpper} Converter · 100% Private</span>
          </div>
          <h1 className={styles.title}>Convert {fromUpper} to {toUpper} Online</h1>
          <p className={styles.description}>
            {route.description} Processed locally in your browser memory — your photos never leave your device.
          </p>
        </header>

        {/* Converter Tool */}
        <div className={styles.converterWrapper}>
          <ImageConverter initialOutputFormat={route.to} />
        </div>

        {/* Editorial "Why Convert" Section */}
        {route.whyConvert && (
          <section className={styles.editorialSection} aria-labelledby="why-convert-title">
            <div className={styles.editorialCard}>
              <div className={styles.editorialHeader}>
                <div className={styles.editorialIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <h2 id="why-convert-title" className={styles.editorialTitle}>
                  Why Convert {fromUpper} to {toUpper}?
                </h2>
              </div>
              <p className={styles.editorialText}>{route.whyConvert}</p>

              {route.idealFor && route.idealFor.length > 0 && (
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>
                    Recommended Use Cases:
                  </strong>
                  <div className={styles.idealForList}>
                    {route.idealFor.map((item, idx) => (
                      <span key={idx} className={styles.idealTag}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {route.recommendedQuality && (
                <div className={styles.tipBox}>
                  <span className={styles.tipIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <p className={styles.tipText}>
                    <strong>Pro Quality Tip:</strong> {route.recommendedQuality}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Technical Specification Table */}
        <section className={styles.tableSection} aria-labelledby="specs-title">
          <h2 id="specs-title" className={styles.sectionTitle}>
            Technical Comparison: {fromUpper} vs {toUpper}
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.specTable}>
              <thead>
                <tr>
                  <th scope="col">Feature Specification</th>
                  <th scope="col">{fromUpper} ({fromInfo.name})</th>
                  <th scope="col">{toUpper} ({toInfo.name})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Full Name</td>
                  <td>{fromInfo.fullName}</td>
                  <td>{toInfo.fullName}</td>
                </tr>
                <tr>
                  <td>File Extension</td>
                  <td className={styles.codeCell}>{fromInfo.extension}</td>
                  <td className={styles.codeCell}>{toInfo.extension}</td>
                </tr>
                <tr>
                  <td>MIME Type</td>
                  <td className={styles.codeCell}>{fromInfo.mimeType}</td>
                  <td className={styles.codeCell}>{toInfo.mimeType}</td>
                </tr>
                <tr>
                  <td>Compression Type</td>
                  <td>
                    <span className={`${styles.statusPill} ${fromInfo.lossy ? styles.pillNo : styles.pillYes}`}>
                      {fromInfo.lossy ? 'Lossy' : 'Lossless'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusPill} ${toInfo.lossy ? styles.pillNo : styles.pillYes}`}>
                      {toInfo.lossy ? 'Lossy' : 'Lossless'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Alpha Transparency</td>
                  <td>
                    <span className={`${styles.statusPill} ${fromInfo.supportsTransparency ? styles.pillYes : styles.pillNo}`}>
                      {fromInfo.supportsTransparency ? 'Supported' : 'Not Supported'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusPill} ${toInfo.supportsTransparency ? styles.pillYes : styles.pillNo}`}>
                      {toInfo.supportsTransparency ? 'Supported' : 'Not Supported'}
                    </span>
                  </td>
                </tr>
                {fromInfo.developer && toInfo.developer && (
                  <tr>
                    <td>Developer / Creator</td>
                    <td>{fromInfo.developer}</td>
                    <td>{toInfo.developer}</td>
                  </tr>
                )}
                {fromInfo.compressionAlgorithm && toInfo.compressionAlgorithm && (
                  <tr>
                    <td>Encoding Algorithm</td>
                    <td>{fromInfo.compressionAlgorithm}</td>
                    <td>{toInfo.compressionAlgorithm}</td>
                  </tr>
                )}
                {fromInfo.maxColors && toInfo.maxColors && (
                  <tr>
                    <td>Color Depth Support</td>
                    <td>{fromInfo.maxColors}</td>
                    <td>{toInfo.maxColors}</td>
                  </tr>
                )}
                {fromInfo.typicalSize && toInfo.typicalSize && (
                  <tr>
                    <td>Relative File Weight</td>
                    <td>{fromInfo.typicalSize}</td>
                    <td>{toInfo.typicalSize}</td>
                  </tr>
                )}
                {fromInfo.browserSupport && toInfo.browserSupport && (
                  <tr>
                    <td>Browser Compatibility</td>
                    <td>{fromInfo.browserSupport}</td>
                    <td>{toInfo.browserSupport}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3 Steps */}
        <section className={styles.stepsSection} aria-labelledby="steps-title">
          <h2 id="steps-title" className={styles.sectionTitle}>
            How to Convert {fromUpper} to {toUpper} in 3 Simple Steps
          </h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Select or Drop Image</h3>
              <p className={styles.stepText}>
                Drag your {fromUpper} file into the converter or click to browse from your device.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Adjust Settings (Optional)</h3>
              <p className={styles.stepText}>
                Fine-tune compression quality or scale dimensions while keeping aspect ratios locked.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Download {toUpper}</h3>
              <p className={styles.stepText}>
                Click Convert and save your optimized {toUpper} image instantly to your computer or phone.
              </p>
            </div>
          </div>
        </section>

        {/* Format-Specific FAQ */}
        <div className={styles.faqWrapper}>
          <FAQ
            items={customFaq}
            title={`${fromUpper} to ${toUpper} FAQs`}
            subtitle={`Answers to common questions about converting ${fromUpper} into ${toUpper}`}
          />
        </div>

        {/* Related routes */}
        {relatedRoutes.length > 0 && (
          <section className={styles.relatedSection} aria-labelledby="related-title">
            <h2 id="related-title" className={styles.relatedTitle}>
              Related Image Conversion Tools
            </h2>
            <div className={styles.relatedGrid}>
              {relatedRoutes.map((r) => (
                <Link key={r.slug} href={`/${r.slug}`} className={styles.relatedLink}>
                  <span>{r.from.toUpperCase()} to {r.to.toUpperCase()} Converter</span>
                  <span className={styles.relatedArrow}>&rarr;</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
