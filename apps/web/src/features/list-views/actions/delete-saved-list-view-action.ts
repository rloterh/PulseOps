'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { deleteSavedListViewFromDb } from '@/features/list-views/repositories/saved-list-views.repository';
import { deleteSavedListViewSchema } from '@/features/list-views/schemas/saved-list-view.schemas';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';

export async function deleteSavedListViewAction(formData: FormData) {
  const parsed = deleteSavedListViewSchema.safeParse({
    resourceType: formData.get('resourceType'),
    savedViewId: formData.get('savedViewId'),
  });

  if (!parsed.success) {
    return;
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
    return;
  }

  const supabase = await createSupabaseServerClient();

  await deleteSavedListViewFromDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    resourceType: parsed.data.resourceType,
    savedViewId: parsed.data.savedViewId,
  });

  revalidatePath(`/${parsed.data.resourceType}`);
}
