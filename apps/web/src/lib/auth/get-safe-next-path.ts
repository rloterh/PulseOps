import type { Route } from 'next';
import { isAuthRoute } from './route-access';

const defaultPath: Route = '/dashboard';

export function getSafeNextPath(
  input: string | null | undefined,
  fallback = defaultPath,
): Route {
  const routeCandidate = input?.split('?')[0]?.split('#')[0];

  if (
    !input?.startsWith('/') ||
    input.startsWith('//') ||
    (routeCandidate ? isAuthRoute(routeCandidate) : false)
  ) {
    return fallback;
  }

  return input as Route;
}
