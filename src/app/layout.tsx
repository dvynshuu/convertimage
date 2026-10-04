import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BRAND } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0b0f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: `${BRAND.name} — Free In-Browser Image Converter (Private, Instant)`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    'Convert JPG, PNG, WebP, AVIF, and Apple HEIC images directly in your browser. 100% private, free, and instant client-side conversion without file uploads or server tracking.',
  keywords: [
    'image converter',
    'free image converter',
    'heic to jpg',
    'convert jpg to webp',
    'convert png to webp',
    'webp to jpg',
    'avif converter',
    'private image converter',
    'client side image conversion',
    'batch image converter',
    'convert iphone photos to jpg',
    'offline image converter',
    'no upload image converter',
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BRAND.url,
    siteName: BRAND.name,
    title: `${BRAND.name} — Free In-Browser Image Converter`,
    description:
      'Convert JPG, PNG, WebP, AVIF, and HEIC images directly in your browser. 100% private, free, and fast client-side image converter.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — Free In-Browser Image Converter`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — Free In-Browser Image Converter`,
    description:
      'Convert JPG, PNG, WebP, AVIF, and HEIC images directly in your browser. 100% private, free, and fast client-side image converter.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  verification: {
    google: 'jj3HxkbuWMfROu4NvRxqcniMRcBXcLdkFXBnQgpv3cU',
  },
};

// Inline script to prevent theme flash before hydration
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />
      </head>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
