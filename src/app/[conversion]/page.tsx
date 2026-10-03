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

  const title = `${route.title} | ${BRAND.name}`;
  const description = route.description;
  const url = `${BRAND.url}/${route.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: BRAND.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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

  // HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to convert ${fromUpper} to ${toUpper}`,
    description: `Step-by-step guide to converting ${fromUpper} images to ${toUpper} format in your browser.`,
    step: [
      {
        '@type': 'HowToStep',
        name: `Select your ${fromUpper} file`,
        text: `Drag and drop your ${fromUpper} file into the converter or click to browse your files.`,
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Adjust quality or resize (optional)',
        text: `Customize compression quality or scale dimensions if desired.`,
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: `Download your ${toUpper} image`,
        text: `Click Convert and download your new ${toUpper} image immediately.`,
        position: 3,
      },
    ],
  };

  const relatedRoutes = CONVERSION_ROUTES.filter(
    (r) => r.slug !== route.slug && (r.from === route.from || r.to === route.to)
  ).slice(0, 4);

  const customFaq: FAQItem[] = [
    {
      question: `How do I convert ${fromUpper} to ${toUpper} without uploading?`,
      answer: `Our converter uses your browser's local processing capabilities. When you choose your ${fromUpper} file, it is decoded and converted to ${toUpper} in memory on your device without ever being sent to a server.`,
    },
    {
      question: `Will converting from ${fromUpper} to ${toUpper} lose quality?`,
      answer: route.to === 'png'
        ? `No. PNG is a lossless format, so converting to PNG preserves image quality without compression artifacts.`
        : `Converting to ${toUpper} is lossy. You can control the quality slider to find the ideal balance between visual clarity and smaller file size.`,
    },
    {
      question: `Is this ${fromUpper} to ${toUpper} converter free to use?`,
      answer: `Yes, it is 100% free with no subscriptions, accounts, or watermarks. For smooth in-browser performance, files are supported up to 25 MB with safe device memory limits.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        suppressHydrationWarning
      />

      <div className={styles.container}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span aria-current="page">{fromUpper} to {toUpper}</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.badge}>
            <span>{fromUpper} &rarr; {toUpper} Converter</span>
          </div>
          <h1 className={styles.title}>{fromUpper} to {toUpper}</h1>
          <p className={styles.description}>{route.description}</p>
        </header>

        {/* Converter Tool */}
        <div className={styles.converterWrapper}>
          <ImageConverter initialOutputFormat={route.to} />
        </div>

        {/* Comparison Details */}
        <section className={styles.comparisonSection}>
          <h2 className={styles.sectionTitle}>Comparing {fromUpper} vs {toUpper}</h2>
          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCard}>
              <h3 className={styles.cardHeader}>{fromInfo.fullName} ({fromUpper})</h3>
              <p className={styles.cardDesc}>{fromInfo.description}</p>
              <ul className={styles.cardList}>
                <li><strong>Type:</strong> {fromInfo.lossy ? 'Lossy' : 'Lossless'}</li>
                <li><strong>Transparency:</strong> {fromInfo.supportsTransparency ? 'Supported' : 'No'}</li>
                <li><strong>Best for:</strong> {fromInfo.goodFor.join(', ')}</li>
              </ul>
            </div>

            <div className={styles.comparisonCard}>
              <h3 className={styles.cardHeader}>{toInfo.fullName} ({toUpper})</h3>
              <p className={styles.cardDesc}>{toInfo.description}</p>
              <ul className={styles.cardList}>
                <li><strong>Type:</strong> {toInfo.lossy ? 'Lossy' : 'Lossless'}</li>
                <li><strong>Transparency:</strong> {toInfo.supportsTransparency ? 'Supported' : 'No'}</li>
                <li><strong>Best for:</strong> {toInfo.goodFor.join(', ')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className={styles.stepsSection}>
          <h2 className={styles.sectionTitle}>How to convert {fromUpper} to {toUpper}</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Select Image</h3>
              <p className={styles.stepText}>Drag and drop your {fromUpper} file or click to browse.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Adjust Settings</h3>
              <p className={styles.stepText}>Optionally resize dimensions or fine-tune compression quality.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Download {toUpper}</h3>
              <p className={styles.stepText}>Click Convert and save your new image instantly to your device.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <div className={styles.faqWrapper}>
          <FAQ
            items={customFaq}
            title={`${fromUpper} to ${toUpper} Questions`}
            subtitle={`Answers to common questions about converting ${fromUpper} into ${toUpper}`}
          />
        </div>

        {/* Related routes */}
        {relatedRoutes.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related Conversion Tools</h2>
            <div className={styles.relatedGrid}>
              {relatedRoutes.map((r) => (
                <Link key={r.slug} href={`/${r.slug}`} className={styles.relatedLink}>
                  <span>{r.from.toUpperCase()} to {r.to.toUpperCase()}</span>
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
