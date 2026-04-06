import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import {
  getNotificationCountsFromDb,
  getNotificationItemsFromDb,
} from '@/features/notifications/repositories/notifications.repository';
import type { NotificationFeed } from '@/features/notifications/types/notification.types';

interface Input {
  tenantId: string;
  viewerId: string;
}

export async function getNotificationFeed({
  tenantId,
  viewerId,
}: Input): Promise<NotificationFeed> {
  const supabase = await createSupabaseServerClient();
  const [items, counts] = await Promise.all([
    getNotificationItemsFromDb(supabase, {
      tenantId,
      viewerId,
      view: 'all',
      limit: 8,
    }),
    getNotificationCountsFromDb(supabase, {
      tenantId,
      viewerId,
    }),
  ]);

  return {
    items,
    unreadCount: counts.unreadCount,
  };
}
