import type { Route } from 'next';
import { getSafeNextPath } from '@/lib/auth/get-safe-next-path';

const defaultReturnPath: Route = '/inbox';

export function getSafeNotificationReturnPath(
  returnPath: string | null | undefined,
  fallback: Route = defaultReturnPath,
): Route {
  return getSafeNextPath(returnPath, fallback);
}
