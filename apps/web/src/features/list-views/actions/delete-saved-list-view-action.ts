'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { deleteSavedListViewFromDb } from '@/features/list-views/repositories/saved-list-views.repository';
import { deleteSavedListViewSchema } from '@/features/list-views/schemas/saved-list-view.schemas';
import type { SavedListViewActionState } from '@/features/list-views/types/list-view.types';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

const invalidDeleteError = 'Choose a valid saved view before removing it.';

export async function deleteSavedListViewAction(
  _previousState: SavedListViewActionState,
  formData: FormData,
): Promise<SavedListViewActionState> {
  const parsed = deleteSavedListViewSchema.safeParse({
    resourceType: formData.get('resourceType'),
    savedViewId: formData.get('savedViewId'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidDeleteError,
    };
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'list-view:delete',
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

  const deleted = await deleteSavedListViewFromDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    resourceType: parsed.data.resourceType,
    savedViewId: parsed.data.savedViewId,
  });

  if (!deleted) {
    return {
      error: 'This saved view is no longer available.',
    };
  }

  revalidatePath(`/${parsed.data.resourceType}`);

  return {};
}
