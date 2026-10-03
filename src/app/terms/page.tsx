import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import styles from './terms.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms and conditions for using ${BRAND.name} image conversion utility.`,
  alternates: {
    canonical: `${BRAND.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: October 2026</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p className={styles.text}>
            By accessing or using {BRAND.name} (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of the utility immediately.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Ownership of Your Content</h2>
          <p className={styles.text}>
            You retain 100% full ownership, copyright, and intellectual property rights to all images you process using {BRAND.name}. We claim no ownership, license, or rights to any images or output files.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Acceptable Use</h2>
          <p className={styles.text}>
            You agree to use {BRAND.name} only for lawful purposes. You must not:
          </p>
          <ul className={styles.list}>
            <li>Use the service to process or distribute unlawful, defamatory, or harmful content.</li>
            <li>Attempt to reverse-engineer, disrupt, or bypass any safeguards built into the website.</li>
            <li>Abuse our service using automated scraping or excessive non-human requests.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Disclaimer of Warranties</h2>
          <p className={styles.text}>
            {BRAND.name} is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
          </p>
          <p className={styles.text}>
            Because image processing is performed client-side on your local hardware and web browser, processing speed and format support may vary based on your device specifications and browser capabilities. We do not guarantee that the service will be uninterrupted or error-free.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Limitation of Liability</h2>
          <p className={styles.text}>
            In no event shall {BRAND.name}, its maintainers, or contributors be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data or loss of profits, arising from your use of or inability to use this service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Contact Information</h2>
          <p className={styles.text}>
            If you have questions regarding these terms, please contact us at{' '}
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
