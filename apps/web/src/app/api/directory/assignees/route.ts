import type { NextRequest } from 'next/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { directorySearchRouteSchema } from '@/features/directory/schemas/directory-search.schema';
import { searchAssignableDirectory } from '@/features/directory/queries/search-assignable-directory';

export async function GET(request: NextRequest) {
  const context = await requireTenantMember();
  const parsed = directorySearchRouteSchema.safeParse({
    locationId: request.nextUrl.searchParams.get('locationId'),
    q: request.nextUrl.searchParams.get('q'),
    limit: request.nextUrl.searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues[0]?.message ?? 'Invalid directory search request.',
      },
      { status: 400 },
    );
  }

  const users = await searchAssignableDirectory({
    organizationId: context.tenantId,
    locationId: parsed.data.locationId ?? context.branchId,
    query: parsed.data.q,
    limit: parsed.data.limit,
  });

  return Response.json({ data: users });
}
