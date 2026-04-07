import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site/get-site-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/jobs', '/incidents', '/tasks'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
