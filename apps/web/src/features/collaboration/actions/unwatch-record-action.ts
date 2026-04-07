'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { getSafeRecordReturnPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import { removeRecordWatcherInDb } from '@/features/collaboration/repositories/collaboration.repository';
import { recordWatchActionSchema } from '@/features/collaboration/schemas/record-comment.schema';

export async function unwatchRecordAction(formData: FormData) {
  const parsed = recordWatchActionSchema.safeParse({
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'collaboration:watch',
      actorId: context.viewerId,
      limit: 80,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await removeRecordWatcherInDb(supabase, {
    tenantId: context.tenantId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
    userId: context.viewerId,
  });

  const returnPath = getSafeRecordReturnPath(
    parsed.data.entityType,
    parsed.data.entityId,
    parsed.data.returnPath,
  );

  revalidatePath(returnPath);
  redirect(returnPath);
}
