export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAtLabel: string;
  kind: 'incident' | 'job' | 'system' | 'billing';
  unread: boolean;
  href?: string;
}
