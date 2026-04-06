import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import {
  getNotificationCountsFromDb,
  getNotificationItemsFromDb,
} from '@/features/notifications/repositories/notifications.repository';
import type {
  NotificationInboxData,
  NotificationView,
} from '@/features/notifications/types/notification.types';

export async function getInboxNotifications(input: {
  tenantId: string;
  viewerId: string;
  view: NotificationView;
}): Promise<NotificationInboxData> {
  const supabase = await createSupabaseServerClient();
  const [items, counts] = await Promise.all([
    getNotificationItemsFromDb(supabase, {
      tenantId: input.tenantId,
      viewerId: input.viewerId,
      view: input.view,
    }),
    getNotificationCountsFromDb(supabase, {
      tenantId: input.tenantId,
      viewerId: input.viewerId,
    }),
  ]);

  return {
    items,
    unreadCount: counts.unreadCount,
    archivedCount: counts.archivedCount,
    totalCount: counts.totalCount,
    view: input.view,
  };
}
