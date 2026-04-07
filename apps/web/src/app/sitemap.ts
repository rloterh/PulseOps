import type { MetadataRoute } from 'next';
import {
  getBlogPosts,
  getDocsPages,
  getHelpArticles,
  getSeoPagesByFamily,
} from '@/lib/content/marketing-content';
import { getSiteUrl } from '@/lib/site/get-site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const staticRoutes = [
    '',
    '/pricing',
    '/contact',
    '/blog',
    '/help',
    '/docs',
    '/screenshots',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date('2026-04-07'),
  }));

  const blogRoutes = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  const helpRoutes = getHelpArticles().map((article) => ({
    url: `${baseUrl}/help/${article.slug}`,
    lastModified: new Date('2026-04-07'),
  }));

  const docsRoutes = getDocsPages().map((page) => ({
    url: `${baseUrl}/docs/${page.slug.join('/')}`,
    lastModified: new Date('2026-04-07'),
  }));

  const seoRoutes = ['compare', 'solutions', 'templates'].flatMap((family) =>
    getSeoPagesByFamily(
      family as 'compare' | 'solutions' | 'templates',
    ).map((page) => ({
      url: `${baseUrl}/${family}/${page.slug}`,
      lastModified: new Date('2026-04-07'),
    })),
  );

  return [...staticRoutes, ...blogRoutes, ...helpRoutes, ...docsRoutes, ...seoRoutes];
}
