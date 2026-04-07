import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('includes public Sprint 10 routes', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://pulseops.app/blog');
    expect(urls).toContain(
      'https://pulseops.app/blog/multi-location-ops-without-spreadsheet-drift',
    );
    expect(urls).toContain(
      'https://pulseops.app/docs/analytics/overview-and-branches',
    );
    expect(urls).toContain(
      'https://pulseops.app/compare/pulseops-vs-generic-ticketing-tools',
    );
  });

  it('uses the configured app url when present', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://preview.pulseops.app/');
    const entries = sitemap();
    expect(entries[0]?.url).toBe('https://preview.pulseops.app');
  });
});
