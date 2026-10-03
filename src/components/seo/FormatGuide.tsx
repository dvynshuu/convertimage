import { FORMAT_INFO } from '@/lib/constants';
import type { InputFormat } from '@/lib/types';
import styles from './FormatGuide.module.css';

const DISPLAY_FORMATS: InputFormat[] = ['webp', 'avif', 'png', 'jpg', 'heic'];

export function FormatGuide() {
  return (
    <section id="formats" className={styles.container} aria-labelledby="formats-title">
      <div className={styles.headingArea}>
        <h2 id="formats-title" className={styles.title}>Which format should you choose?</h2>
        <p className={styles.subtitle}>
          Understand the strengths and trade-offs of modern image formats
        </p>
      </div>

      <div className={styles.grid}>
        {DISPLAY_FORMATS.map((key) => {
          const info = FORMAT_INFO[key];
          if (!info) return null;

          return (
            <div key={key} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.formatName}>{info.name}</span>
                <span className={styles.badge}>
                  {info.lossy ? 'Lossy' : 'Lossless'}
                  {info.supportsTransparency ? ' · Alpha' : ''}
                </span>
              </div>

              <p className={styles.description}>{info.description}</p>

              <div>
                <div className={styles.sectionTitle}>Best used for:</div>
                <ul className={styles.list}>
                  {info.goodFor.map((point, idx) => (
                    <li key={idx} className={styles.listItem}>
                      <span className={styles.checkIcon} aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
