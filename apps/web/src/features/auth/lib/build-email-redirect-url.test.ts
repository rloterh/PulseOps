import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildEmailRedirectUrl } from './build-email-redirect-url';

describe('buildEmailRedirectUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds the auth callback url without duplicating slashes', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://pulseops-ruby.vercel.app/');

    expect(buildEmailRedirectUrl()).toBe(
      'https://pulseops-ruby.vercel.app/callback?next=%2Fdashboard',
    );
  });

  it('falls back to the canonical production domain when the env is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    expect(buildEmailRedirectUrl('/onboarding')).toBe(
      'https://pulseops.app/callback?next=%2Fonboarding',
    );
  });
});
