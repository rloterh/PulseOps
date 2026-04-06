'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getSafeNotificationReturnPath } from '@/features/notifications/lib/get-safe-notification-return-path';
import { markAllNotificationsReadInDb } from '@/features/notifications/repositories/notifications.repository';

const markAllNotificationsReadSchema = z.object({
  returnPath: z.string().trim().min(1),
});

export async function markAllNotificationsReadAction(formData: FormData) {
  const parsed = markAllNotificationsReadSchema.safeParse({
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();

  await markAllNotificationsReadInDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
  });

  const returnPath = getSafeNotificationReturnPath(parsed.data.returnPath);
  revalidatePath(returnPath);
  redirect(returnPath);
}
