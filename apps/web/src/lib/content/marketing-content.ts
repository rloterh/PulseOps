import {
  blogPosts,
  docsPages,
  helpArticles,
  screenshotScenes,
  seoPages,
  type BlogPost,
  type DocsPageEntry,
  type HelpArticle,
  type ScreenshotScene,
  type SeoPageEntry,
} from '@/content/marketing/content';

function compareByNewest(a: { publishedAt: string }, b: { publishedAt: string }) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export function getBlogPosts(): BlogPost[] {
  return [...blogPosts].sort(compareByNewest);
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export function getHelpArticles(): HelpArticle[] {
  return [...helpArticles];
}

export function getHelpArticleBySlug(slug: string): HelpArticle | null {
  return helpArticles.find((article) => article.slug === slug) ?? null;
}

export function getDocsPages(): DocsPageEntry[] {
  return [...docsPages];
}

export function getDocsPageBySlug(slug: string[]): DocsPageEntry | null {
  if (slug.length === 0) {
    return docsPages[0] ?? null;
  }

  return docsPages.find((page) => page.slug.join('/') === slug.join('/')) ?? null;
}

export function getSeoPagesByFamily(
  family: SeoPageEntry['family'],
): SeoPageEntry[] {
  return seoPages.filter((page) => page.family === family);
}

export function getSeoPageByFamilyAndSlug(
  family: SeoPageEntry['family'],
  slug: string,
): SeoPageEntry | null {
  return (
    seoPages.find((page) => page.family === family && page.slug === slug) ?? null
  );
}

export function getScreenshotScenes(): ScreenshotScene[] {
  return [...screenshotScenes];
}
