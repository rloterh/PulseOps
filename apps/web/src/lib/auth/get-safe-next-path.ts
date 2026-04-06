import type { Route } from 'next';

const defaultPath: Route = '/dashboard';

export function getSafeNextPath(
  input: string | null | undefined,
  fallback = defaultPath,
): Route {
  if (!input?.startsWith('/') || input.startsWith('//')) {
    return fallback;
  }

  return input as Route;
}
