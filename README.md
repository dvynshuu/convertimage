# ConvertImage — Fast, Private, In-Browser Image Converter

> Convert your images quickly, privately, and for free. All image processing runs directly inside your browser using client-side Canvas and WebAssembly. No files are ever uploaded to a server.

---

## Features

- **100% Free, Client-Side & Private**: Your images never leave your computer or phone. Zero server uploads, zero paywalls, zero accounts required.
- **High-Volume Batch Processing**: Convert up to 500+ images simultaneously with a dedicated Web Worker concurrency queue running off the main thread.
- **Multi-File ZIP Archiving**: One-click download of all converted images into a compressed `.zip` archive via `JSZip`.
- **EXIF & Geolocation Privacy Control**: Selectively preserve camera and timestamp metadata, with optional GPS geolocation sanitization.
- **Modern Formats**: Convert between **JPG**, **PNG**, **WebP**, **AVIF**, and iPhone **HEIC/HEIF**.
- **Quality & Compression Control**: Format-aware lossy quality slider (1%–100%) and lossless PNG handling.
- **Dimension Scaling & Resizing**: Instant resize presets (75%, 50%, 25%) plus custom width and height inputs with automatic aspect ratio preservation.
- **Before & After Interactive Comparison**: Drag-to-reveal split slider to visually inspect compression artifacts before downloading.
- **Format Intelligence**: Auto-detection via file magic bytes, MIME types, and file extensions to prevent format spoofing.
- **Full SEO Engine**: 12 static landing pages (e.g., `/jpg-to-png`, `/heic-to-jpg`, `/png-to-webp`) with structured `HowTo`, `FAQPage`, and `WebApplication` Schema.org JSON-LD markup.
- **Production Minimalist Design System**: Clean solid surfaces, zero AI-generic radioactive glows, high-contrast dark and light modes, accessible contrast ratios, and keyboard navigation.

---

## Architecture & Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Static Site Generation (SSG) for all SEO routes, zero server runtime |
| **Language** | TypeScript (Strict) | Exhaustive type checking for state machines, codecs, and worker protocols |
| **Styling** | Vanilla CSS Modules | Zero runtime overhead, strict design token system, no utility bloat |
| **Decoding Engine** | `createImageBitmap` + `heic2any` | Native browser decoding hardware-accelerated; lazy-loads `heic2any` for HEIC |
| **Encoding Engine** | `OffscreenCanvas` / Canvas 2D | In-memory canvas rendering to `image/jpeg`, `image/png`, `image/webp`, `image/avif` |
| **Testing** | Node.js Test Runner + `tsx` | Native sub-second unit test execution for formats, magic bytes, and calculations |

### Image Processing Pipeline

```
[User File]
    │
    ▼
1. Validation & Magic Byte Sniffing (≤25MB, ≤100MP, detect true format)
    │
    ▼
2. Decoding Pipeline
    ├─ If HEIC/HEIF ──► Dynamic import of `heic2any` ──► JPEG/PNG intermediate Blob
    └─ Standard ──────► `createImageBitmap` (hardware-accelerated off-thread decode)
    │
    ▼
3. Transformation Pipeline
    ├─ Dimension calculation (preserving aspect ratio)
    └─ `OffscreenCanvas` drawImage scaling with high-quality smoothing
    │
    ▼
4. Encoding Pipeline
    └─ `canvas.convertToBlob({ type, quality })` ──► Target Blob
    │
    ▼
5. Result & Memory Management
    ├─ Generates Object URL for preview & download
    └─ Explicit `URL.revokeObjectURL()` cleanup on reset to avoid leaks
```

---

## Supported Formats

| Format | Input | Output | Compression | Transparency | Browser Support |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **JPG / JPEG** | Yes | Yes | Lossy | No | Universal (100%) |
| **PNG** | Yes | Yes | Lossless | Yes | Universal (100%) |
| **WebP** | Yes | Yes | Lossy / Lossless | Yes | Modern Browsers (98%+) |
| **AVIF** | Yes | Yes | Next-Gen Lossy | Yes | Chrome, Edge, Firefox (Safari decode only) |
| **HEIC / HEIF** | Yes | No (Source) | Lossy | Yes | Decoded via lazy-loaded WASM/JS codec |

---

## Browser Limitations & Fallbacks

- **AVIF Encoding**: Supported in Chromium-based browsers (Chrome, Edge, Brave, Opera) and Firefox. On Safari, browser-level AVIF *encoding* is currently restricted by WebKit; ConvertImage automatically detects this via `checkAvifSupport()` and gracefully disables the AVIF output option while recommending WebP.
- **Safety Boundaries**: Maximum file size is set to 25 MB and maximum image dimension to 100 megapixels to safeguard against browser tab crashes and memory overflow on mobile devices.
- **Zero Background Sync**: Because all conversions are in-memory, closing the browser tab will discard any active conversion without leaving persistent files on disk.

---

## Development & Testing

### Prerequisites
- Node.js 18.18+ (tested on Node 25.3.0)
- npm 9+

### Installation
```bash
git clone <repo-url>
cd image-convert
npm install
```

### Run Development Server
```bash
npm run dev
# Server starts at http://localhost:3000
```

### Run Unit Tests
```bash
npm test
# Executes 27 unit tests across formats, EXIF metadata, license verification, and size calculations
```

### Production Build
```bash
npm run build
# Generates fully static optimized SSG output for all pages and routes
```

### Serve Production Build
```bash
npm start
```

---

## Static Deployment Guide

Because ConvertImage is 100% client-side with pre-rendered SSG pages, it can be deployed to any static host with zero configuration:

### Vercel
```bash
npx vercel
```

### Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `.next` (or export directory)

### Netlify
- Build command: `npm run build`
- Publish directory: `.next`

---

## Project Structure

```
├── public/
│   ├── favicon.svg
│   ├── og-image.jpg
│   └── icon.jpg
├── src/
│   ├── app/
│   │   ├── [conversion]/          # 12 Dynamic SEO landing pages (SSG)
│   │   │   ├── page.tsx
│   │   │   └── conversion.module.css
│   │   ├── privacy/               # Privacy policy
│   │   ├── terms/                 # Terms of service
│   │   ├── globals.css            # Design tokens (Light/Dark)
│   │   ├── layout.tsx             # Root layout with Inter font & theme script
│   │   ├── page.tsx               # Homepage
│   │   ├── page.module.css
│   │   ├── icon.svg               # App icon
│   │   ├── manifest.ts            # PWA Webmanifest
│   │   ├── robots.ts              # Robots.txt
│   │   └── sitemap.ts             # Dynamic XML sitemap
│   ├── components/
│   │   ├── converter/             # Converter UI components
│   │   │   ├── ComparisonSlider.tsx
│   │   │   ├── ConversionProgress.tsx
│   │   │   ├── DownloadButton.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── FormatSelector.tsx
│   │   │   ├── ImageConverter.tsx
│   │   │   ├── QualitySlider.tsx
│   │   │   ├── ResizeControls.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── UploadZone.tsx
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── seo/                   # SEO & Content components
│   │       ├── FAQ.tsx
│   │       ├── Features.tsx
│   │       └── FormatGuide.tsx
│   ├── hooks/
│   │   ├── useDragDrop.ts         # Drag & drop state management
│   │   ├── useImageConverter.ts   # Main conversion state machine
│   │   └── useTheme.ts            # Light / dark / system theme hook
│   └── lib/
│       ├── constants.ts           # Centralized copy, routes, limits & FAQ
│       ├── formats.ts             # Magic bytes, MIME detection, size helpers
│       ├── types.ts               # Discriminated union types & protocols
│       └── conversion/
│           └── engine.ts          # OffscreenCanvas & heic2any conversion core
└── tests/
    └── formats.test.ts            # 18 unit tests
```

---

## License

MIT © ConvertImage. All user images remain 100% user property.
