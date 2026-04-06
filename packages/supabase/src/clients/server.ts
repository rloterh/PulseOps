import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { getClientEnv } from '@pulseops/env/client';
import { cookies } from 'next/headers';
import type { Database } from '../types/database';

export async function createSupabaseServerClient() {
  const env = getClientEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies directly.
          }
        },
      },
    },
  );
}
