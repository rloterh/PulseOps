'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import {
  getSafeNotificationDestinationPath,
  getSafeNotificationReturnPath,
} from '@/features/notifications/lib/get-safe-notification-return-path';
import { markNotificationReadInDb } from '@/features/notifications/repositories/notifications.repository';

const openNotificationSchema = z.object({
  notificationId: z.uuid(),
  href: z.string().trim().min(1),
  returnPath: z.string().trim().min(1),
});

export async function openNotificationAction(formData: FormData) {
  const parsed = openNotificationSchema.safeParse({
    notificationId: formData.get('notificationId'),
    href: formData.get('href'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();
  const supabase = await createSupabaseServerClient();

  await markNotificationReadInDb(supabase, {
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    notificationId: parsed.data.notificationId,
  });

  const returnPath = getSafeNotificationReturnPath(parsed.data.returnPath);
  const destinationPath = getSafeNotificationDestinationPath(parsed.data.href);

  revalidatePath(returnPath);
  revalidatePath(destinationPath);
  redirect(destinationPath);
}
