'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { getSafeRecordReturnPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import {
  getCollaborationTargetFromDb,
  setRecordWatcherMuteStateInDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import type { CollaborationActionState } from '@/features/collaboration/types/collaboration.types';

const toggleWatchMuteSchema = z.object({
  entityType: z.enum(['incident', 'job', 'task']),
  entityId: z.uuid(),
  returnPath: z.string().trim().min(1),
  isMuted: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .transform((value) => value === true || value === 'true'),
});

const invalidWatchError = 'Choose a valid record before updating your watch state.';

export async function toggleWatchMuteAction(
  _previousState: CollaborationActionState,
  formData: FormData,
): Promise<CollaborationActionState> {
  const parsed = toggleWatchMuteSchema.safeParse({
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    returnPath: formData.get('returnPath'),
    isMuted: formData.get('isMuted'),
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

  await setRecordWatcherMuteStateInDb(supabase, {
    tenantId: context.tenantId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
    userId: context.viewerId,
    isMuted: parsed.data.isMuted,
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
