import type { FormatInfo, ConversionRoute, InputFormat, OutputFormat } from './types';

/* ─── File Size & Dimension Limits ─── */

export const IMAGE_LIMITS = {
  maxFileSizeMB: 25,
  maxFileSizeBytes: 25 * 1024 * 1024,
  maxPixels: 100_000_000,          // 100 megapixels
  maxDimension: 16384,             // single side max
  maxBatchFiles: 50,               // safe in-browser batch queue limit
  maxConcurrentWorkers: 4,         // safe worker concurrency cap
} as const;

/* ─── Site URL Configuration ─── */

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'https://convertimage.pages.dev';
}

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
    developer: 'Joint Photographic Experts Group',
    compressionAlgorithm: 'Discrete Cosine Transform (DCT)',
    maxColors: '16.7 Million (24-bit)',
    browserSupport: '100% Universal (All browsers)',
    typicalSize: 'Moderate (Standard baseline)',
    description: 'The world\'s most universal image format for photographs and web images. Offers robust lossy compression with fine-tunable quality and universal compatibility across all operating systems, software, and devices.',
    goodFor: ['Photographs', 'Web images', 'Email attachments', 'Social media', 'Print workflows'],
    limitations: ['No transparency support (alpha channel)', 'Generation loss on repeated edits', 'Visible block artifacts at high compression'],
  },
  png: {
    name: 'PNG',
    fullName: 'PNG (Portable Network Graphics)',
    extension: '.png',
    mimeType: 'image/png',
    lossy: false,
    supportsTransparency: true,
    developer: 'W3C & PNG Development Group',
    compressionAlgorithm: 'Deflate (LZ77 + Huffman)',
    maxColors: 'Up to 48-bit Truecolor + 16-bit Alpha',
    browserSupport: '100% Universal (All browsers)',
    typicalSize: 'Large for photos; Compact for graphics',
    description: 'The industry-standard lossless raster graphics format. Delivers crisp pixel precision with full 8-bit and 16-bit alpha transparency, making it the premier choice for UI assets, screenshots, illustrations, and logos.',
    goodFor: ['Screenshots', 'Graphics with text', 'Transparent logos & icons', 'Medical/technical imaging', 'Digital illustrations'],
    limitations: ['Significantly larger file sizes for photographic scenes', 'No progressive rendering in basic configurations'],
  },
  webp: {
    name: 'WebP',
    fullName: 'WebP Image Format',
    extension: '.webp',
    mimeType: 'image/webp',
    lossy: true,
    supportsTransparency: true,
    developer: 'Google',
    compressionAlgorithm: 'VP8 (Lossy) / VP8L (Lossless)',
    maxColors: '16.7 Million + 8-bit Alpha',
    browserSupport: '98%+ (Chrome, Edge, Safari, Firefox)',
    typicalSize: '25%–35% smaller than comparable JPG',
    description: 'A modern, high-performance image format created by Google. Provides superior lossy and lossless compression with alpha transparency support, accelerating web page speeds and slashing CDN data transfer.',
    goodFor: ['Web performance optimization', 'Core Web Vitals enhancement', 'Transparent web graphics', 'Modern responsive picture tags'],
    limitations: ['Legacy photo viewers on older Windows/macOS may require plugins', 'Limited support in dated desktop print software'],
  },
  avif: {
    name: 'AVIF',
    fullName: 'AV1 Image File Format',
    extension: '.avif',
    mimeType: 'image/avif',
    lossy: true,
    supportsTransparency: true,
    developer: 'Alliance for Open Media (AOMedia)',
    compressionAlgorithm: 'AV1 Video Codec Intra-frame',
    maxColors: '10-bit and 12-bit High Dynamic Range (HDR)',
    browserSupport: '93%+ (Chrome, Edge, Firefox, Safari 16+)',
    typicalSize: '50% smaller than JPG; 20% smaller than WebP',
    description: 'The bleeding-edge next-generation open image codec derived from AV1 video technology. Delivers unprecedented file size compression and full HDR wide-gamut color without noticeable quality degradation.',
    goodFor: ['Maximum bandwidth savings', 'Hero headers & high-traffic sites', 'HDR photography', 'Next-gen web development'],
    limitations: ['Slightly slower encoding times due to complex intra-frame computation', 'Incompatible with older browsers and legacy OS versions'],
  },
  heic: {
    name: 'HEIC',
    fullName: 'HEIC (High Efficiency Image Container)',
    extension: '.heic',
    mimeType: 'image/heic',
    lossy: true,
    supportsTransparency: false,
    developer: 'MPEG / Apple Inc.',
    compressionAlgorithm: 'HEVC / H.265 Intra-frame',
    maxColors: 'Up to 16-bit color depth',
    browserSupport: 'Apple Safari only; Incompatible with Chrome/Firefox native render',
    typicalSize: '50% smaller than legacy JPEG',
    description: 'The default camera capture format on Apple iPhones and iPads since iOS 11. Stores twice the photographic detail of JPEG at half the file size, but frequently fails to open on Windows PCs, Android devices, and web forms.',
    goodFor: ['iPhone and iPad photography', 'Apple ecosystem workflows', 'Live Photos and image bursts'],
    limitations: ['Widespread incompatibility with Windows, Android, and web upload portals', 'Requires conversion for sharing and cross-platform viewing'],
  },
  heif: {
    name: 'HEIF',
    fullName: 'High Efficiency Image File Format',
    extension: '.heif',
    mimeType: 'image/heif',
    lossy: true,
    supportsTransparency: false,
    developer: 'Moving Picture Experts Group (MPEG)',
    compressionAlgorithm: 'HEVC / H.265 Intra-frame',
    maxColors: 'Up to 16-bit color depth',
    browserSupport: 'Safari native; Incompatible with Chrome/Firefox native render',
    typicalSize: '50% smaller than legacy JPEG',
    description: 'The open High Efficiency Image File standard used by modern Samsung Galaxy devices, Sony Alpha, and Canon cameras. Delivers twice the compression efficiency of standard JPEG with superior color preservation.',
    goodFor: ['Samsung Galaxy photography', 'Canon & Sony digital cameras', 'High dynamic range scenes', 'Storage efficiency'],
    limitations: ['Limited legacy Windows and web browser decode support', 'Requires conversion for cross-platform sharing'],
  },
};

/* ─── SEO Conversion Routes ─── */

export const CONVERSION_ROUTES: ConversionRoute[] = [
  {
    slug: 'heic-to-jpg',
    from: 'heic',
    to: 'jpg',
    title: 'Convert HEIC to JPG — Free Online Converter',
    description: 'Convert iPhone HEIC photos to universally compatible JPG format. Free, private, no upload required. Instant in-browser conversion with zero quality loss.',
    whyConvert: 'Apple iPhones save camera shots in HEIC to save storage, but Windows PCs, Android phones, and web upload forms often reject them. Converting to JPG gives you 100% universal compatibility across all devices and platforms.',
    recommendedQuality: '85% – 90% preserves virtually indistinguishable iPhone photo detail while keeping file sizes lightweight.',
    idealFor: ['iPhone photo sharing', 'Windows PC viewing', 'Government & job portal uploads', 'Email attachments'],
  },
  {
    slug: 'heif-to-jpg',
    from: 'heif',
    to: 'jpg',
    title: 'Convert HEIF to JPG — Free Online Converter',
    description: 'Convert Samsung, Sony, and Canon HEIF photos to universally compatible JPG. Free, private, client-side in-browser conversion with zero server uploads.',
    whyConvert: 'Android devices and professional cameras frequently capture in HEIF format for storage savings, but desktop apps and online portals reject them. Converting to JPG makes your photos accessible everywhere.',
    recommendedQuality: '85% – 90% matches original camera fidelity while producing lightweight, universal JPG files.',
    idealFor: ['Samsung Galaxy photos', 'Sony Alpha & Canon camera exports', 'Web upload forms', 'Desktop photo editing'],
  },
  {
    slug: 'jpg-to-webp',
    from: 'jpg',
    to: 'webp',
    title: 'Convert JPG to WebP — Free Online Converter',
    description: 'Convert JPG images to modern WebP format for 25%–35% smaller file sizes. Free, private, browser-based conversion optimized for website speed and Core Web Vitals.',
    whyConvert: 'Google WebP slashes 25% to 35% off JPG file sizes at identical visual fidelity. Converting your website JPGs directly boosts Google PageSpeed Insights, decreases bandwidth costs, and improves mobile load times.',
    recommendedQuality: '80% – 85% provides the sweet spot of crisp visuals and maximum file weight reduction.',
    idealFor: ['Website speed optimization', 'WordPress & Shopify media libraries', 'Blog publishing', 'Core Web Vitals optimization'],
  },
  {
    slug: 'png-to-webp',
    from: 'png',
    to: 'webp',
    title: 'Convert PNG to WebP — Free Online Converter',
    description: 'Convert PNG images to WebP format while preserving transparent backgrounds. Slash image weight by up to 70% with free, private, client-side conversion.',
    whyConvert: 'Heavy transparent PNGs can easily exceed 2 MB to 5 MB. WebP preserves full transparent alpha channels while reducing file size by 50% to 75%, making sites load significantly faster.',
    recommendedQuality: '85% for lossy with transparency, or 100% for lossless WebP compression.',
    idealFor: ['Transparent logos', 'UI components & icons', 'Product graphics with transparent backdrops', 'App assets'],
  },
  {
    slug: 'webp-to-jpg',
    from: 'webp',
    to: 'jpg',
    title: 'Convert WebP to JPG — Free Online Converter',
    description: 'Convert downloaded WebP images to universally compatible JPG format. Free, private, no upload required. Instant local conversion in your browser.',
    whyConvert: 'Modern websites serve images in .webp format, but older image editors, Microsoft Office, Photoshop, and printing services often refuse to open them. Converting to JPG fixes compatibility in one click.',
    recommendedQuality: '85% ensures maximum fidelity for photos downloaded from the internet.',
    idealFor: ['Opening WebP in Photoshop or Illustrator', 'Printing services', 'Legacy Windows/Mac software', 'Document insertion'],
  },
  {
    slug: 'webp-to-png',
    from: 'webp',
    to: 'png',
    title: 'Convert WebP to PNG — Free Online Converter',
    description: 'Convert WebP images to lossless PNG format with transparency support. Free, private, browser-based conversion with zero data tracking.',
    whyConvert: 'When you need to edit a WebP graphic in software that lacks native WebP support, converting to lossless PNG preserves every pixel and transparent layer intact.',
    recommendedQuality: 'Lossless (100%) — PNG always retains maximum digital detail.',
    idealFor: ['Graphic design workflows', 'Transparent icon editing', 'Print preparation', 'Asset archival'],
  },
  {
    slug: 'jpg-to-png',
    from: 'jpg',
    to: 'png',
    title: 'Convert JPG to PNG — Free Online Converter',
    description: 'Convert JPG images to PNG format instantly in your browser. Free, private, no upload required. Preserve image fidelity with lossless PNG conversion.',
    whyConvert: 'Converting JPG to PNG prevents further generational compression loss when preparing images for repeated edits, compositing, text overlay, or graphic software requirements.',
    recommendedQuality: 'Lossless (100%) — perfectly captures original JPG pixels into a clean PNG container.',
    idealFor: ['Design mockups', 'Raster editing', 'Software requiring PNG input', 'Preventing compression artifact accumulation'],
  },
  {
    slug: 'png-to-jpg',
    from: 'png',
    to: 'jpg',
    title: 'Convert PNG to JPG — Free Online Converter',
    description: 'Convert large PNG images to lightweight JPG format instantly in your browser. Free, private, no upload required. Dramatically reduce file sizes.',
    whyConvert: 'High-resolution PNG screenshots and camera exports often balloon to 10 MB or more. Converting to JPG shrinks file size by up to 80% for seamless emailing and file uploads.',
    recommendedQuality: '85% yields great balance between crisp sharpness and compact file size.',
    idealFor: ['Downsizing screenshots', 'Emailing photo attachments', 'Overcoming strict upload limits', 'Freeing storage'],
  },
  {
    slug: 'heic-to-png',
    from: 'heic',
    to: 'png',
    title: 'Convert HEIC to PNG — Free Online Converter',
    description: 'Convert iPhone HEIC photos to PNG format with lossless fidelity and maximum sharpness. Free, private, client-side browser conversion.',
    whyConvert: 'Need uncompressed, pixel-perfect extraction of your iPhone photos for design work or printing? Converting HEIC to PNG ensures no secondary lossy compression artifacts are introduced.',
    recommendedQuality: 'Lossless (100%) — pure pixel rendering from Apple HEIC container.',
    idealFor: ['High-end photo editing', 'Digital artwork', 'Desktop publishing', 'Uncompressed image archiving'],
  },
  {
    slug: 'heic-to-webp',
    from: 'heic',
    to: 'webp',
    title: 'Convert HEIC to WebP — Free Online Converter',
    description: 'Convert iPhone HEIC photos directly into lightweight, web-ready WebP format. Free, private, client-side conversion for instant web publishing.',
    whyConvert: 'Transfer iPhone photos straight to your blog or web application in one streamlined step. WebP delivers web compatibility with the same high-efficiency compression as HEIC.',
    recommendedQuality: '82% – 85% delivers lightweight files ready for instant web deployment.',
    idealFor: ['Mobile blogging', 'Direct web publishing from iPhone', 'Social media managers', 'CDN optimization'],
  },
  {
    slug: 'avif-to-jpg',
    from: 'avif',
    to: 'jpg',
    title: 'Convert AVIF to JPG — Free Online Converter',
    description: 'Convert next-gen AVIF images to universally compatible JPG format. Free, private, no upload required. Instant in-browser conversion.',
    whyConvert: 'AVIF offers cutting-edge compression, but many operating systems, image viewers, and photo labs cannot decode it yet. Converting to JPG makes your images viewable anywhere.',
    recommendedQuality: '85% preserves the rich tone and dynamic range of AVIF images.',
    idealFor: ['Cross-platform viewing', 'Legacy desktop tools', 'Photo printing', 'Social sharing'],
  },
  {
    slug: 'avif-to-png',
    from: 'avif',
    to: 'png',
    title: 'Convert AVIF to PNG — Free Online Converter',
    description: 'Convert AVIF images to lossless PNG format with full transparency preservation. Free, private, browser-based conversion.',
    whyConvert: 'Extract AVIF assets into lossless PNG format to guarantee compatibility with all image manipulation suites without sacrificing transparency or color gradients.',
    recommendedQuality: 'Lossless (100%) — maintains all visual information and alpha channels.',
    idealFor: ['Graphic design', 'UI asset extraction', 'Transparency preservation', 'Vector tracing prep'],
  },
  {
    slug: 'jpg-to-avif',
    from: 'jpg',
    to: 'avif',
    title: 'Convert JPG to AVIF — Free Online Converter',
    description: 'Convert JPG images to next-generation AVIF format for maximum compression and web performance. Free, private, in-browser conversion.',
    whyConvert: 'AVIF cuts file sizes by up to 50% compared to JPG, delivering the fastest possible web loading times and top Google PageSpeed scores.',
    recommendedQuality: '65% AVIF matches or exceeds the visual quality of an 85% JPG at a fraction of the bandwidth.',
    idealFor: ['High-traffic websites', 'E-commerce hero banners', 'Bandwidth reduction', 'Next-gen web development'],
  },
  {
    slug: 'png-to-avif',
    from: 'png',
    to: 'avif',
    title: 'Convert PNG to AVIF — Free Online Converter',
    description: 'Convert PNG images to AVIF for ultra-compact file sizes with full alpha transparency. Free, private, browser-based conversion.',
    whyConvert: 'Transform heavy transparent PNG graphics into lightweight AVIF images that load in milliseconds while maintaining crisp transparent borders.',
    recommendedQuality: '65% – 70% preserves sharp graphics and transparent edges with massive byte savings.',
    idealFor: ['Modern web apps', 'Transparent web illustrations', 'Next-gen UI assets', 'Bandwidth conservation'],
  },
  {
    slug: 'webp-to-avif',
    from: 'webp',
    to: 'avif',
    title: 'Convert WebP to AVIF — Free Online Converter',
    description: 'Upgrade your WebP images to next-gen AVIF for an additional 20% file size reduction. Free, private, browser-based conversion.',
    whyConvert: 'Take web optimization to the absolute limit. AVIF outperforms WebP by an additional 15% to 20% in compression efficiency, particularly at lower byte budgets.',
    recommendedQuality: '65% delivers outstanding visual fidelity at ultra-compact file weights.',
    idealFor: ['Performance purists', 'Cutting-edge web engineering', 'Mobile web apps', 'Global CDN optimization'],
  },
  {
    slug: 'heic-to-avif',
    from: 'heic',
    to: 'avif',
    title: 'Convert HEIC to AVIF — Free Online Converter',
    description: 'Convert Apple HEIC photos to open next-gen AVIF format. Free, private, browser-based conversion with no server uploads.',
    whyConvert: 'Move from Apple\'s proprietary HEIC container to the open-standard AVIF format for modern web delivery without losing high-efficiency compression.',
    recommendedQuality: '65% matches Apple\'s native photographic clarity.',
    idealFor: ['Web asset preparation', 'Open-standard archiving', 'Modern web distribution', 'Cross-platform web galleries'],
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
    answer: 'Yes. The converter is completely free with no hidden costs, subscriptions, watermarks, or sign-ups.',
  },
  {
    question: 'Can I convert HEIC photos from my iPhone?',
    answer: 'Yes. You can convert HEIC and HEIF photos from iPhones and iPads to JPG, PNG, WebP, or AVIF format directly in your browser.',
  },
  {
    question: 'Does conversion reduce image quality?',
    answer: 'Converting to lossy formats like JPG, WebP, or AVIF involves some quality trade-off, which you control using the quality slider. Converting to PNG is lossless and preserves full quality. Higher quality settings produce larger files.',
  },
  {
    question: 'Does the converter work on mobile?',
    answer: 'Yes. The converter is fully responsive and works on modern mobile browsers including Chrome and Safari on both iOS and Android with device memory safeguards.',
  },
  {
    question: 'What happens to my files after conversion?',
    answer: 'Your files exist only in your browser\'s temporary memory during conversion. Once you close the tab or start a new conversion, that memory is released. Nothing is stored permanently.',
  },
  {
    question: 'Why is my converted file larger than the original?',
    answer: 'This can happen when converting from a highly compressed format to a less compressed one, or when converting to lossless PNG. Try reducing the quality setting or choosing a different output format.',
  },
  {
    question: 'What is the maximum file size?',
    answer: `You can convert images up to ${IMAGE_LIMITS.maxFileSizeMB} MB and up to ${IMAGE_LIMITS.maxBatchFiles} files per batch. These practical limits ensure your browser stays fast and stable without running out of memory.`,
  },
  {
    question: 'Does AVIF conversion work in all browsers?',
    answer: 'AVIF encoding is supported in Chrome, Edge, and Firefox. Safari has limited AVIF support. If your browser cannot encode AVIF, the converter will automatically detect this and disable the option with an explanation.',
  },
];

/* ─── Brand ─── */

export const BRAND = {
  name: 'ConvertImage',
  tagline: 'Fast. Private. Simple.',
  description: 'Free, private image conversion directly in your browser.',
  get url() {
    return getSiteUrl();
  },
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
    tooLarge: `This image is too large to process safely in your browser (max ${IMAGE_LIMITS.maxFileSizeMB} MB).`,
    tooLargeAction: `Please choose an image under ${IMAGE_LIMITS.maxFileSizeMB} MB.`,
    unsupported: "This file doesn't appear to be a supported image format.",
    unsupportedAction: 'Try JPG, PNG, WebP, AVIF, or HEIC.',
    dimensionsTooLarge: "This image's dimensions exceed safe browser processing limits.",
    browserLimitation: 'Your browser does not support this conversion.',
    browserLimitationAction: 'Try using Chrome, Edge, or Firefox for full compatibility.',
    decodeFailed: "We couldn't read this image file.",
    encodeFailed: "We couldn't encode the image in this format.",
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
