import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Learn how ${BRAND.name} converts images directly in your browser with 100% privacy and zero data tracking.`,
  alternates: {
    canonical: `${BRAND.url}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: October 2026</p>
      </header>

      <div className={styles.highlightBox}>
        <span className={styles.highlightIcon} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </span>
        <div>
          <div className={styles.highlightTitle}>100% Private by Design</div>
          <p className={styles.highlightText}>
            Your images are processed locally on your own computer or phone. They are never transmitted over the internet, never uploaded to a remote server, and never saved or analyzed by us or any third party.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. How In-Browser Processing Works</h2>
          <p className={styles.text}>
            Traditional online image converters upload your files to their cloud servers, process them remotely, and provide a download link. This requires sending your personal photos over the internet.
          </p>
          <p className={styles.text}>
            {BRAND.name} works differently. Using standard web technologies including HTML5 Canvas API and WebAssembly, all decoding, resizing, and re-encoding happens inside your browser’s isolated memory space. The moment you close the tab, the image data is completely cleared from memory.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Information We Do Not Collect</h2>
          <ul className={styles.list}>
            <li><strong>Your Images:</strong> We cannot view, store, intercept, or share your images because they never reach our servers.</li>
            <li><strong>Personal Data:</strong> We do not ask for your name, email, phone number, or any personal details to use our converter.</li>
            <li><strong>Filesystem Data:</strong> We only access the specific image file you explicitly choose or drag into the window.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Local Storage & Cookies</h2>
          <p className={styles.text}>
            {BRAND.name} does not use tracking cookies or advertising cookies.
          </p>
          <p className={styles.text}>
            We use your browser’s standard <code>localStorage</code> solely to remember your UI color theme preference (Light, Dark, or System default). No identifier or personal data is attached to this setting.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Hosting & Infrastructure</h2>
          <p className={styles.text}>
            This website is hosted on static content delivery networks (CDNs). When you load the webpage, standard web server logs (such as your IP address, browser user-agent, and HTTP request headers) may be recorded by the hosting infrastructure solely for technical performance and DDoS protection.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Contact Us</h2>
          <p className={styles.text}>
            If you have questions or feedback about our privacy architecture, feel free to contact us at{' '}
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
