import type { MetadataRoute } from 'next';
import { CONVERSION_ROUTES, BRAND } from '@/lib/constants';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BRAND.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BRAND.url}/batch-image-converter`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BRAND.url}/image-compressor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BRAND.url}/image-resizer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BRAND.url}/convert-iphone-photos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BRAND.url}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BRAND.url}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const topSlugs = new Set(['heic-to-jpg', 'jpg-to-webp', 'png-to-webp', 'webp-to-jpg', 'png-to-jpg', 'heic-to-png']);

  for (const route of CONVERSION_ROUTES) {
    routes.push({
      url: `${BRAND.url}/${route.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: topSlugs.has(route.slug) ? 0.9 : 0.8,
    });
  }

  return routes;
}
