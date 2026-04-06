'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { deleteSavedListViewFromDb } from '@/features/list-views/repositories/saved-list-views.repository';
import { deleteSavedListViewSchema } from '@/features/list-views/schemas/saved-list-view.schemas';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export async function deleteSavedListViewAction(formData: FormData) {
  const parsed = deleteSavedListViewSchema.safeParse({
    resourceType: formData.get('resourceType'),
    savedViewId: formData.get('savedViewId'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();

  await deleteSavedListViewFromDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    resourceType: parsed.data.resourceType,
    savedViewId: parsed.data.savedViewId,
  });

  revalidatePath(`/${parsed.data.resourceType}`);
}
