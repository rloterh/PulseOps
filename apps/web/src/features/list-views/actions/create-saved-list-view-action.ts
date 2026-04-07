'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import {
  createSavedListViewInDb,
  getSavedListViewsCountFromDb,
} from '@/features/list-views/repositories/saved-list-views.repository';
import {
  createSavedListViewSchema,
  parseSavedListViewFilters,
} from '@/features/list-views/schemas/saved-list-view.schemas';
import type { SavedListViewActionState } from '@/features/list-views/types/list-view.types';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

export async function createSavedListViewAction(
  _prevState: SavedListViewActionState,
  formData: FormData,
): Promise<SavedListViewActionState> {
  const parsed = createSavedListViewSchema.safeParse({
    resourceType: formData.get('resourceType'),
    name: formData.get('name'),
    filtersPayload: formData.get('filtersPayload'),
  });

  if (!parsed.success) {
    return {
      error: 'Provide a short name so this view can be reused later.',
    };
  }

  const filters = parseSavedListViewFilters(
    parsed.data.resourceType,
    parsed.data.filtersPayload,
  );

  if (!filters) {
    return {
      error: 'The current filters could not be saved.',
    };
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'list-view:create',
      actorId: context.viewerId,
      limit: 40,
      windowMs: 15 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many saved view changes. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const [entitlements, savedViewCount] = await Promise.all([
    getOrganizationEntitlements(context.tenantId),
    getSavedListViewsCountFromDb(supabase, {
      tenantId: context.tenantId,
      viewerId: context.viewerId,
    }),
  ]);

  if (savedViewCount >= entitlements.maxSavedViews) {
    return {
      error: `Your current plan supports up to ${String(entitlements.maxSavedViews)} saved views. Upgrade billing to add more.`,
    };
  }

  try {
    await createSavedListViewInDb(supabase, {
      tenantId: context.tenantId,
      viewerId: context.viewerId,
      resourceType: parsed.data.resourceType,
      name: parsed.data.name,
      filters: filters as Record<string, unknown>,
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      return {
        error: 'A saved view with that name already exists.',
      };
    }

    return {
      error: 'The view could not be saved right now.',
    };
  }

  revalidatePath(`/${parsed.data.resourceType}`);

  return {
    success: 'Saved view added.',
  };
}
