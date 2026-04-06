'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getSafeRecordReturnPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import {
  ensureRecordWatchersInDb,
  getCollaborationTargetFromDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import { recordWatchActionSchema } from '@/features/collaboration/schemas/record-comment.schema';

export async function watchRecordAction(formData: FormData) {
  const parsed = recordWatchActionSchema.safeParse({
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();
  const target = await getCollaborationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
  });

  if (!target) {
    return;
  }

  await ensureRecordWatchersInDb(supabase, {
    target,
    watchers: [
      {
        userId: context.viewerId,
        source: 'manual',
      },
    ],
  });

  const returnPath = getSafeRecordReturnPath(
    parsed.data.entityType,
    parsed.data.entityId,
    parsed.data.returnPath,
  );

  revalidatePath(returnPath);
  redirect(returnPath);
}
