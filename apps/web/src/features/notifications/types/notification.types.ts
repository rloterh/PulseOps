import type { RecordEntityType } from '@/features/collaboration/types/collaboration.types';

export type NotificationEventType =
  | 'comment'
  | 'mention'
  | 'assignment'
  | 'status_change'
  | 'record_created';

export type NotificationView = 'all' | 'unread' | 'archived';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAtLabel: string;
  kind: RecordEntityType;
  eventType: NotificationEventType;
  unread: boolean;
  archived: boolean;
  href: string;
  branchName: string | null;
}

export interface NotificationFeed {
  items: NotificationItem[];
  unreadCount: number;
}

export interface NotificationInboxData {
  items: NotificationItem[];
  unreadCount: number;
  archivedCount: number;
  totalCount: number;
  view: NotificationView;
}
