import 'server-only';

import { headers } from 'next/headers';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { getRequestFingerprint } from '@/lib/security/request-fingerprint';
import { SafeError } from '@/lib/security/safe-error';

export async function enforceServerActionRateLimit(options: {
  bucket: string;
  actorId: string;
  limit: number;
  windowMs: number;
}) {
  const requestHeaders = await headers();
  const fingerprint = getRequestFingerprint(requestHeaders);

  return enforceRateLimit({
    bucket: options.bucket,
    actorId: options.actorId,
    fingerprintKey: fingerprint.key,
    limit: options.limit,
    windowMs: options.windowMs,
  });
}

export async function isServerActionRateLimited(options: {
  bucket: string;
  actorId: string;
  limit: number;
  windowMs: number;
}) {
  try {
    await enforceServerActionRateLimit(options);
    return false;
  } catch (error) {
    if (error instanceof SafeError && error.code === 'RATE_LIMITED') {
      return true;
    }

    throw error;
  }
}
