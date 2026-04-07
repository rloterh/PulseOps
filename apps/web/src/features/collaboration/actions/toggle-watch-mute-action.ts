'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { getSafeRecordReturnPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import { setRecordWatcherMuteStateInDb } from '@/features/collaboration/repositories/collaboration.repository';

const toggleWatchMuteSchema = z.object({
  entityType: z.enum(['incident', 'job', 'task']),
  entityId: z.uuid(),
  returnPath: z.string().trim().min(1),
  isMuted: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .transform((value) => value === true || value === 'true'),
});

export async function toggleWatchMuteAction(formData: FormData) {
  const parsed = toggleWatchMuteSchema.safeParse({
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    returnPath: formData.get('returnPath'),
    isMuted: formData.get('isMuted'),
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
}
