import { createServerClient } from '@supabase/ssr';
import { getClientEnv } from '@pulseops/env/client';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '../types/database';

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  const env = getClientEnv();

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
