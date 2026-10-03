import styles from './Features.module.css';

const FEATURES = [
  {
    title: '100% Private',
    text: 'Your photos never leave your device. All decoding and encoding is executed locally in your browser memory without uploading to any server.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Lightning Fast',
    text: 'Zero network upload lag. Conversions happen near instantaneously using modern browser APIs and native image rasterization engines.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: 'Next-Gen Compression',
    text: 'Easily convert heavyweight PNGs and JPGs to high-efficiency WebP and AVIF to speed up websites and slash bandwidth usage.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20" />
        <polyline points="20 10 14 10 14 4" />
        <line x1="14" y1="10" x2="21" y2="3" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    ),
  },
  {
    title: 'iPhone HEIC Support',
    text: 'Convert iOS live photos and HEIC snapshots seamlessly to standard JPG or PNG for effortless sharing with non-Apple devices.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Custom Resizing',
    text: 'Scale down dimensions by 75%, 50%, 25%, or specify exact custom width and height while maintaining aspect ratios automatically.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    ),
  },
  {
    title: 'No Watermarks or Limits',
    text: 'No file count limits, no forced registrations, no intrusive paywalls, and never any watermarks stamped onto your images.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className={styles.container} aria-labelledby="features-title">
      <div className={styles.headingArea}>
        <h2 id="features-title" className={styles.title}>Engineered for speed and privacy</h2>
        <p className={styles.subtitle}>
          The modern web utility that respects your machine and your personal data
        </p>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((item, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.iconWrap} aria-hidden="true">
              {item.icon}
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardText}>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
