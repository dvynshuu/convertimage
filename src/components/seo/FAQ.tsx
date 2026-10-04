import { FAQ_DATA, type FAQItem } from '@/lib/constants';
import styles from './FAQ.module.css';

interface FAQProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  includeSchema?: boolean;
}

export function FAQ({
  items = FAQ_DATA,
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about our browser-based image converter',
  className = '',
  includeSchema = true,
}: FAQProps) {
  // Generate JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className={`${styles.container} ${className}`} aria-labelledby="faq-title">
      {includeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
      )}

      <div className={styles.headingArea}>
        <h2 id="faq-title" className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.list}>
        {items.map((item, index) => (
          <details key={index} className={styles.item}>
            <summary className={styles.summary}>
              <span>{item.question}</span>
              <span className={styles.icon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </summary>
            <div className={styles.answer}>
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
