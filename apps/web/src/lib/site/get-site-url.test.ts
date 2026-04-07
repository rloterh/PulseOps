import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSiteUrl } from '@/lib/site/get-site-url';

describe('getSiteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to the production site url when env is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
    expect(getSiteUrl()).toBe('https://pulseops.app');
  });

  it('trims trailing slashes from configured urls', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://preview.pulseops.app///');
    expect(getSiteUrl()).toBe('https://preview.pulseops.app');
  });
});
