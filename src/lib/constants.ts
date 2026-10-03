import type { FormatInfo, ConversionRoute, InputFormat, OutputFormat } from './types';

/* ─── File Size & Dimension Limits ─── */

export const IMAGE_LIMITS = {
  maxFileSizeMB: 25,
  maxFileSizeBytes: 25 * 1024 * 1024,
  maxPixels: 100_000_000,          // 100 megapixels
  maxDimension: 16384,             // single side max
} as const;

/* ─── Default Quality Values ─── */

export const DEFAULT_QUALITY: Record<OutputFormat, number> = {
  jpg: 0.85,
  png: 1,
  webp: 0.82,
  avif: 0.65,
};

/* ─── Quality Ranges ─── */

export const QUALITY_RANGE = {
  min: 0.01,
  max: 1,
  step: 0.01,
} as const;

/* ─── Accepted Input MIME Types ─── */

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
] as const;

export const ACCEPTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.heif',
] as const;

export const ACCEPT_STRING = ACCEPTED_MIME_TYPES.join(',') + ',' + ACCEPTED_EXTENSIONS.join(',');

/* ─── Magic Bytes for Format Detection ─── */

export const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number; format: InputFormat }[]> = {
  jpeg: [{ bytes: [0xFF, 0xD8, 0xFF], offset: 0, format: 'jpg' }],
  png: [{ bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0, format: 'png' }],
  webp: [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, format: 'webp' }], // RIFF header
  avif: [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, format: 'avif' }], // ftyp at offset 4
  heic: [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, format: 'heic' }], // ftyp at offset 4 (same container)
};

/* ─── Format Information for Education / SEO ─── */

export const FORMAT_INFO: Record<string, FormatInfo> = {
  jpg: {
    name: 'JPG',
    fullName: 'JPEG (Joint Photographic Experts Group)',
    extension: '.jpg',
    mimeType: 'image/jpeg',
    lossy: true,
    supportsTransparency: false,
    description: 'The most widely used image format for photographs and web images. Offers excellent compression for photographic content with adjustable quality.',
    goodFor: ['Photographs', 'Web images', 'Email attachments', 'Social media'],
    limitations: ['No transparency support', 'Lossy compression degrades quality', 'Not ideal for text or graphics'],
  },
  png: {
    name: 'PNG',
    fullName: 'PNG (Portable Network Graphics)',
    extension: '.png',
    mimeType: 'image/png',
    lossy: false,
    supportsTransparency: true,
    description: 'A lossless format that preserves full image quality with transparency support. Ideal for graphics, screenshots, and images requiring sharp edges.',
    goodFor: ['Screenshots', 'Graphics with text', 'Logos and icons', 'Images needing transparency'],
    limitations: ['Larger file sizes than JPG for photos', 'Not ideal for photographs'],
  },
  webp: {
    name: 'WebP',
    fullName: 'WebP',
    extension: '.webp',
    mimeType: 'image/webp',
    lossy: true,
    supportsTransparency: true,
    description: 'A modern format developed by Google offering superior compression. Provides smaller file sizes than both JPG and PNG while supporting transparency.',
    goodFor: ['Web delivery', 'Smaller file sizes', 'Modern websites', 'Performance optimization'],
    limitations: ['Limited support in older applications', 'Some social media platforms may not accept it'],
  },
  avif: {
    name: 'AVIF',
    fullName: 'AVIF (AV1 Image File Format)',
    extension: '.avif',
    mimeType: 'image/avif',
    lossy: true,
    supportsTransparency: true,
    description: 'A next-generation format offering exceptional compression efficiency. Delivers the smallest file sizes while maintaining visual quality.',
    goodFor: ['Maximum compression', 'Web performance', 'High-quality images at small sizes', 'Modern browsers'],
    limitations: ['Slower encoding', 'Limited browser support in older versions', 'Some apps cannot open AVIF files'],
  },
  heic: {
    name: 'HEIC',
    fullName: 'HEIC (High Efficiency Image Container)',
    extension: '.heic',
    mimeType: 'image/heic',
    lossy: true,
    supportsTransparency: false,
    description: 'The default photo format on modern Apple devices. Offers excellent quality at small file sizes but has limited support outside the Apple ecosystem.',
    goodFor: ['iPhone and iPad photos', 'Apple ecosystem'],
    limitations: ['Limited Windows/Android support', 'Most websites do not accept HEIC', 'Requires conversion for sharing'],
  },
};

/* ─── SEO Conversion Routes ─── */

export const CONVERSION_ROUTES: ConversionRoute[] = [
  {
    slug: 'jpg-to-png',
    from: 'jpg',
    to: 'png',
    title: 'Convert JPG to PNG — Free Online Converter',
    description: 'Convert JPG images to PNG format instantly in your browser. Free, private, no upload required. Preserve quality with lossless PNG conversion.',
  },
  {
    slug: 'png-to-jpg',
    from: 'png',
    to: 'jpg',
    title: 'Convert PNG to JPG — Free Online Converter',
    description: 'Convert PNG images to JPG format instantly in your browser. Free, private, no upload required. Reduce file sizes while maintaining quality.',
  },
  {
    slug: 'jpg-to-webp',
    from: 'jpg',
    to: 'webp',
    title: 'Convert JPG to WebP — Free Online Converter',
    description: 'Convert JPG images to WebP format for smaller file sizes. Free, private, browser-based conversion. Optimized for web performance.',
  },
  {
    slug: 'png-to-webp',
    from: 'png',
    to: 'webp',
    title: 'Convert PNG to WebP — Free Online Converter',
    description: 'Convert PNG images to WebP format with transparency support. Free, private, browser-based conversion.',
  },
  {
    slug: 'webp-to-jpg',
    from: 'webp',
    to: 'jpg',
    title: 'Convert WebP to JPG — Free Online Converter',
    description: 'Convert WebP images to universally compatible JPG format. Free, private, no upload required.',
  },
  {
    slug: 'webp-to-png',
    from: 'webp',
    to: 'png',
    title: 'Convert WebP to PNG — Free Online Converter',
    description: 'Convert WebP images to PNG format with lossless quality. Free, private, browser-based conversion.',
  },
  {
    slug: 'heic-to-jpg',
    from: 'heic',
    to: 'jpg',
    title: 'Convert HEIC to JPG — Free Online Converter',
    description: 'Convert iPhone HEIC photos to universally compatible JPG format. Free, private, no upload required. Works directly in your browser.',
  },
  {
    slug: 'heic-to-png',
    from: 'heic',
    to: 'png',
    title: 'Convert HEIC to PNG — Free Online Converter',
    description: 'Convert iPhone HEIC photos to PNG format with lossless quality. Free, private, browser-based conversion.',
  },
  {
    slug: 'avif-to-jpg',
    from: 'avif',
    to: 'jpg',
    title: 'Convert AVIF to JPG — Free Online Converter',
    description: 'Convert AVIF images to widely compatible JPG format. Free, private, no upload required.',
  },
  {
    slug: 'avif-to-png',
    from: 'avif',
    to: 'png',
    title: 'Convert AVIF to PNG — Free Online Converter',
    description: 'Convert AVIF images to PNG format with lossless quality. Free, private, browser-based conversion.',
  },
  {
    slug: 'jpg-to-avif',
    from: 'jpg',
    to: 'avif',
    title: 'Convert JPG to AVIF — Free Online Converter',
    description: 'Convert JPG images to AVIF for maximum compression and web performance. Free, private, browser-based.',
  },
  {
    slug: 'png-to-avif',
    from: 'png',
    to: 'avif',
    title: 'Convert PNG to AVIF — Free Online Converter',
    description: 'Convert PNG images to AVIF for smaller file sizes. Free, private, browser-based conversion.',
  },
];

/* ─── FAQ Data ─── */

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: 'Are my images uploaded to a server?',
    answer: 'No. All image processing happens directly in your browser using your device\'s processor. Your images never leave your device and are never sent to any server.',
  },
  {
    question: 'Which image formats are supported?',
    answer: 'You can convert from JPG, JPEG, PNG, WebP, AVIF, HEIC, and HEIF formats. Output formats include JPG, PNG, WebP, and AVIF.',
  },
  {
    question: 'Is the converter free?',
    answer: 'Yes. The converter is completely free with no hidden costs, sign-ups, or watermarks.',
  },
  {
    question: 'Can I convert HEIC photos from my iPhone?',
    answer: 'Yes. You can convert HEIC and HEIF photos from iPhones and iPads to JPG, PNG, WebP, or AVIF format.',
  },
  {
    question: 'Does conversion reduce image quality?',
    answer: 'Converting to lossy formats like JPG, WebP, or AVIF involves some quality trade-off, which you control using the quality slider. Converting to PNG is lossless and preserves full quality. Higher quality settings produce larger files.',
  },
  {
    question: 'Does the converter work on mobile?',
    answer: 'Yes. The converter is fully responsive and works on all modern mobile browsers including Chrome and Safari on both iOS and Android.',
  },
  {
    question: 'What happens to my files after conversion?',
    answer: 'Your files exist only in your browser\'s memory during conversion. Once you close the tab or start a new conversion, the data is released. Nothing is stored permanently.',
  },
  {
    question: 'Why is my converted file larger than the original?',
    answer: 'This can happen when converting from a highly compressed format to a less compressed one, or when converting to lossless PNG. Try reducing the quality setting or choosing a different output format.',
  },
  {
    question: 'What is the maximum file size?',
    answer: `You can convert images up to 25 MB. This limit exists to ensure smooth performance in your browser.`,
  },
  {
    question: 'Does AVIF conversion work in all browsers?',
    answer: 'AVIF encoding is supported in Chrome, Edge, and Firefox. Safari has limited AVIF support. If your browser cannot encode AVIF, you will see a clear message suggesting an alternative format.',
  },
];

/* ─── Brand ─── */

export const BRAND = {
  name: 'ConvertImage',
  tagline: 'Fast. Private. Simple.',
  description: 'Free image conversion directly in your browser.',
  url: 'https://convertimage.dev',
  email: 'hello@convertimage.dev',
} as const;

/* ─── Copy / Microcopy ─── */

export const COPY = {
  hero: {
    title: 'Convert images in seconds.',
    subtitle: 'Fast, private image conversion directly in your browser.',
  },
  upload: {
    empty: 'Drop an image here',
    emptyAction: 'or choose a file',
    hover: 'Drop to convert',
    preparing: 'Preparing image…',
    processing: 'Converting your image…',
    success: 'Your image is ready.',
    privacy: 'Processed locally in your browser.',
  },
  errors: {
    generic: "We couldn't convert this image.",
    corrupted: 'The file appears to be corrupted or damaged.',
    tooLarge: 'This image is too large to process safely in your browser.',
    tooLargeAction: 'Please choose an image under 25 MB.',
    unsupported: 'This file format is not supported.',
    unsupportedAction: 'Try JPG, PNG, WebP, AVIF, or HEIC.',
    dimensionsTooLarge: 'This image\'s dimensions exceed the safe processing limit.',
    browserLimitation: 'Your browser does not support this conversion.',
    browserLimitationAction: 'Try using Chrome or Edge for the best compatibility.',
    decodeFailed: 'We couldn\'t read this image file.',
    encodeFailed: 'We couldn\'t encode the image in this format.',
    tryAnother: 'Try another file.',
    retry: 'Try again',
  },
  download: {
    button: 'Download',
  },
  result: {
    saved: 'Saved',
    larger: 'Output is',
    largerSuffix: 'larger',
    original: 'Original',
    converted: 'Converted',
  },
  formats: 'JPG · PNG · WebP · AVIF · HEIC',
} as const;
