import { describe, expect, it } from 'vitest';
import {
  getBlogPostBySlug,
  getBlogPosts,
  getDocsPageBySlug,
  getSeoPageByFamilyAndSlug,
} from '@/lib/content/marketing-content';

describe('marketing content helpers', () => {
  it('sorts blog posts newest first', () => {
    const posts = getBlogPosts();
    expect(posts[0]?.slug).toBe('multi-location-ops-without-spreadsheet-drift');
    expect(posts[1]?.slug).toBe('why-explainable-ai-matters-in-ops-software');
  });

  it('resolves blog posts by slug', () => {
    expect(
      getBlogPostBySlug('how-to-present-ops-health-to-buyers-and-leadership')
        ?.title,
    ).toContain('present ops health');
  });

  it('returns the docs index page for an empty docs slug', () => {
    expect(getDocsPageBySlug([])?.slug).toEqual(['getting-started']);
  });

  it('finds SEO pages by family and slug', () => {
    expect(
      getSeoPageByFamilyAndSlug(
        'compare',
        'pulseops-vs-generic-ticketing-tools',
      )?.title,
    ).toContain('generic ticketing tools');
  });
});
