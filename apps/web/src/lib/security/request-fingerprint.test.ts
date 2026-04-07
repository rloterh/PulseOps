import { getRequestFingerprint } from '@/lib/security/request-fingerprint';

describe('request-fingerprint', () => {
  it('prefers the first forwarded IP address', () => {
    const fingerprint = getRequestFingerprint(
      new Headers({
        'x-forwarded-for': '203.0.113.5, 10.0.0.2',
        'user-agent': 'PulseOps Browser',
      }),
    );

    expect(fingerprint.ip).toBe('203.0.113.5');
    expect(fingerprint.key).toContain('203.0.113.5');
  });

  it('falls back safely when no headers are present', () => {
    const fingerprint = getRequestFingerprint(new Headers());

    expect(fingerprint.ip).toBe('unknown');
    expect(fingerprint.userAgent).toBe('');
  });
});
