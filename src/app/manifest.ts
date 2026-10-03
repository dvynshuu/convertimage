import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — Private Image Converter`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0b0f',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
