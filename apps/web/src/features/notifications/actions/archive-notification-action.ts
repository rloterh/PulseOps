'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getSafeNotificationReturnPath } from '@/features/notifications/lib/get-safe-notification-return-path';
import { setNotificationArchivedStateInDb } from '@/features/notifications/repositories/notifications.repository';

const archiveNotificationSchema = z.object({
  notificationId: z.uuid(),
  returnPath: z.string().trim().min(1),
});

export async function archiveNotificationAction(formData: FormData) {
  const parsed = archiveNotificationSchema.safeParse({
    notificationId: formData.get('notificationId'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();

  await setNotificationArchivedStateInDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    notificationId: parsed.data.notificationId,
    isArchived: true,
  });

  const returnPath = getSafeNotificationReturnPath(parsed.data.returnPath);
  revalidatePath(returnPath);
  redirect(returnPath);
}
