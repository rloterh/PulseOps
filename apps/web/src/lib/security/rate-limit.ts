import { SafeError } from '@/lib/security/safe-error';

interface RateLimitWindow {
  count: number;
  resetAt: number;
}

type RateLimitStore = Map<string, RateLimitWindow>;

declare global {
  var __pulseopsRateLimitStore: RateLimitStore | undefined;
}

const store =
  (globalThis.__pulseopsRateLimitStore ??= new Map<string, RateLimitWindow>());

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export interface EnforceRateLimitOptions {
  bucket: string;
  fingerprintKey: string;
  limit: number;
  windowMs: number;
  actorId?: string | null;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function checkRateLimit(
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(options.key);

  if (!existing || existing.resetAt <= now) {
    store.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: now + options.windowMs,
      limit: options.limit,
    };
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
      limit: options.limit,
    };
  }

  existing.count += 1;
  store.set(options.key, existing);

  return {
    success: true,
    remaining: options.limit - existing.count,
    resetAt: existing.resetAt,
    limit: options.limit,
  };
}

export function enforceRateLimit(
  options: EnforceRateLimitOptions,
): RateLimitResult {
  const key = [
    options.bucket,
    options.actorId ?? 'anonymous',
    options.fingerprintKey,
  ].join(':');

  const result = checkRateLimit({
    key,
    limit: options.limit,
    windowMs: options.windowMs,
  });

  if (!result.success) {
    throw new SafeError({
      code: 'RATE_LIMITED',
      status: 429,
      userMessage: 'Too many requests. Please wait a moment and try again.',
    });
  }

  return result;
}

export function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
