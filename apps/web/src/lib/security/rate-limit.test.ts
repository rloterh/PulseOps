import {
  buildRateLimitHeaders,
  checkRateLimit,
  enforceRateLimit,
} from '@/lib/security/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    globalThis.__pulseopsRateLimitStore?.clear();
  });

  it('tracks remaining requests inside the active window', () => {
    const first = checkRateLimit({
      key: 'test:bucket',
      limit: 2,
      windowMs: 1_000,
    });
    const second = checkRateLimit({
      key: 'test:bucket',
      limit: 2,
      windowMs: 1_000,
    });

    expect(first.success).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it('throws a safe error when the bucket is exhausted', () => {
    enforceRateLimit({
      bucket: 'ai:overview',
      fingerprintKey: '127.0.0.1:test-agent',
      actorId: 'user-1',
      limit: 1,
      windowMs: 1_000,
    });

    try {
      enforceRateLimit({
        bucket: 'ai:overview',
        fingerprintKey: '127.0.0.1:test-agent',
        actorId: 'user-1',
        limit: 1,
        windowMs: 1_000,
      });
    } catch (error) {
      expect(error).toMatchObject({
        code: 'RATE_LIMITED',
        status: 429,
      });
      return;
    }

    throw new Error('Expected enforceRateLimit to throw.');
  });

  it('builds stable response headers', () => {
    const result = checkRateLimit({
      key: 'test:headers',
      limit: 5,
      windowMs: 5_000,
    });

    expect(buildRateLimitHeaders(result)).toMatchObject({
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '4',
    });
  });
});
