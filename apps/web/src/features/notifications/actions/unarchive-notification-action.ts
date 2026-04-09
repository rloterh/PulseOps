'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { getSafeNotificationReturnPath } from '@/features/notifications/lib/get-safe-notification-return-path';
import { setNotificationArchivedStateInDb } from '@/features/notifications/repositories/notifications.repository';
import type { NotificationActionState } from '@/features/notifications/types/notification.types';

const unarchiveNotificationSchema = z.object({
  notificationId: z.uuid(),
  returnPath: z.string().trim().min(1),
});

const invalidArchiveError = 'Choose a valid notification before restoring it.';

export async function unarchiveNotificationAction(
  _previousState: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  const parsed = unarchiveNotificationSchema.safeParse({
    notificationId: formData.get('notificationId'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? invalidArchiveError,
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

  const restored = await setNotificationArchivedStateInDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    notificationId: parsed.data.notificationId,
    isArchived: false,
  });

  if (!restored) {
    return {
      error: 'This notification is no longer available.',
    };
  }

  const returnPath = getSafeNotificationReturnPath(parsed.data.returnPath);
  revalidatePath(returnPath);
  redirect(returnPath);

  return {};
}
