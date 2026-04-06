import { createServerClient } from '@supabase/ssr';
import { getClientEnv, type ClientEnv } from '@pulseops/env/client';
import type { Database } from '../types/database';

interface MiddlewareRequestLike {
  cookies: {
    getAll(): { name: string; value: string }[];
  };
}

interface MiddlewareResponseLike {
  cookies: {
    set(...args: unknown[]): unknown;
  };
}

export function createSupabaseMiddlewareClient(
  request: MiddlewareRequestLike,
  response: MiddlewareResponseLike,
  env: ClientEnv = getClientEnv(),
) {
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}
