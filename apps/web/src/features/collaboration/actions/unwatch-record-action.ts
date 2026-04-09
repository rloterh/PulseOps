'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { getSafeRecordReturnPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import {
  getCollaborationTargetFromDb,
  removeRecordWatcherInDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import { recordWatchActionSchema } from '@/features/collaboration/schemas/record-comment.schema';
import type { CollaborationActionState } from '@/features/collaboration/types/collaboration.types';

const invalidWatchError = 'Choose a valid record before updating your watch state.';

export async function unwatchRecordAction(
  _previousState: CollaborationActionState,
  formData: FormData,
): Promise<CollaborationActionState> {
  const parsed = recordWatchActionSchema.safeParse({
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidWatchError,
    };
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
    return {
      error: 'Too many watch updates. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const target = await getCollaborationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
  });

  if (!target) {
    return {
      error: 'This record is no longer available.',
    };
  }

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

  return {};
}
