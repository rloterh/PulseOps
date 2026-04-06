import type { NotificationView } from '@/features/notifications/types/notification.types';

const validViews = new Set<NotificationView>(['all', 'unread', 'archived']);

export function parseNotificationView(
  value: string | string[] | undefined,
): NotificationView {
  if (typeof value !== 'string') {
    return 'all';
  }

  return validViews.has(value as NotificationView)
    ? (value as NotificationView)
    : 'all';
}
