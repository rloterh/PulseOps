import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { log } from '@/lib/observability/logger';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/security/rate-limit';
import { getRequestFingerprint } from '@/lib/security/request-fingerprint';
import { SafeError, createSafeErrorResponse } from '@/lib/security/safe-error';
import { directorySearchRouteSchema } from '@/features/directory/schemas/directory-search.schema';
import { searchAssignableDirectory } from '@/features/directory/queries/search-assignable-directory';

export async function GET(request: NextRequest) {
  const context = await requireTenantMember();
  const fingerprint = getRequestFingerprint(request.headers);

  let rateLimitHeaders: Record<string, string> | undefined;

  try {
    const rateLimit = enforceRateLimit({
      bucket: 'directory:assignees',
      fingerprintKey: fingerprint.key,
      actorId: context.viewerId,
      limit: 80,
      windowMs: 10 * 60 * 1000,
    });
    rateLimitHeaders = buildRateLimitHeaders(rateLimit);

    const parsed = directorySearchRouteSchema.safeParse({
      locationId: request.nextUrl.searchParams.get('locationId'),
      q: request.nextUrl.searchParams.get('q'),
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      throw new SafeError({
        code: 'INVALID_DIRECTORY_SEARCH',
        userMessage: parsed.error.issues[0]?.message ?? 'Invalid directory search request.',
      });
    }

    const users = await searchAssignableDirectory({
      organizationId: context.tenantId,
      locationId: parsed.data.locationId ?? context.branchId,
      query: parsed.data.q,
      limit: parsed.data.limit,
    });

    return NextResponse.json({ data: users }, { headers: rateLimitHeaders });
  } catch (error) {
    log(error instanceof SafeError ? 'warn' : 'error', {
      message: 'Failed to search assignable directory.',
      context: {
        tenantId: context.tenantId,
        viewerId: context.viewerId,
        branchId: context.branchId,
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return createSafeErrorResponse(
      error,
      rateLimitHeaders ? { headers: rateLimitHeaders } : {},
    );
  }
}
