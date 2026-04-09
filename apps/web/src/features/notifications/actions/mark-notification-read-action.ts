'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { getSafeNotificationReturnPath } from '@/features/notifications/lib/get-safe-notification-return-path';
import { markNotificationReadInDb } from '@/features/notifications/repositories/notifications.repository';
import type { NotificationActionState } from '@/features/notifications/types/notification.types';

const markNotificationReadSchema = z.object({
  notificationId: z.uuid(),
  returnPath: z.string().trim().min(1),
});

const invalidReadError = 'Choose a valid notification before marking it as read.';

export async function markNotificationReadAction(
  _previousState: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  const parsed = markNotificationReadSchema.safeParse({
    notificationId: formData.get('notificationId'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidReadError,
    };
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'notification:mutation',
      actorId: context.viewerId,
      limit: 120,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return {
      error: 'Too many notification updates. Please wait a moment and try again.',
    };
  }

  const supabase = await createSupabaseServerClient();

  const marked = await markNotificationReadInDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    notificationId: parsed.data.notificationId,
  });

  if (!marked) {
    return {
      error: 'This notification is no longer available.',
    };
  }

  const returnPath = getSafeNotificationReturnPath(parsed.data.returnPath);
  revalidatePath(returnPath);
  redirect(returnPath);

  return {};
}
