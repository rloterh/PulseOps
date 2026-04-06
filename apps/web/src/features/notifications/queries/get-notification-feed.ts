import 'server-only';

import type { NotificationItem } from '@/features/notifications/types/notification.types';

interface Input {
  tenantName: string;
  viewerName: string | null;
  activeBranchName: string | null;
}

export function getNotificationFeed({
  tenantName,
  viewerName,
  activeBranchName,
}: Input): NotificationItem[] {
  const branchLabel = activeBranchName ?? 'the active branch';
  const viewerLabel = viewerName ?? 'your ops lead';

  return [
    {
      id: 'notif_incident_1',
      title: 'Critical incident opened',
      body: `${branchLabel} needs immediate review in ${tenantName}.`,
      createdAtLabel: '10 min ago',
      kind: 'incident',
      unread: true,
      href: '/incidents',
    },
    {
      id: 'notif_job_1',
      title: 'Job queue needs triage',
      body: `${viewerLabel}, three upcoming jobs are waiting on sequencing.`,
      createdAtLabel: '42 min ago',
      kind: 'job',
      unread: true,
      href: '/jobs',
    },
    {
      id: 'notif_system_1',
      title: 'Branch summary refreshed',
      body: 'The Sprint 2 dashboard shell finished preparing the latest summary.',
      createdAtLabel: 'Today',
      kind: 'system',
      unread: false,
      href: '/dashboard',
    },
  ];
}
