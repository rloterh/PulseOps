import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { loadLocationNameMap } from '@/lib/data/load-label-maps';
import { getRecordDetailPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import type { CollaborationTarget } from '@/features/collaboration/types/collaboration.types';
import type {
  NotificationEventType,
  NotificationItem,
  NotificationView,
} from '@/features/notifications/types/notification.types';

type DatabaseNotificationEvent =
  Database['public']['Tables']['record_notifications']['Row']['event_type'];

function toNotificationItem(
  row: Database['public']['Tables']['record_notifications']['Row'],
  branchNames: Map<string, string>,
): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAtLabel: formatDateTimeLabel(row.created_at),
    kind: row.entity_type as NotificationItem['kind'],
    eventType: row.event_type as NotificationEventType,
    unread: row.read_at === null,
    archived: row.archived_at !== null,
    href: row.href,
    branchName: branchNames.get(row.location_id) ?? null,
  };
}

export async function getNotificationItemsFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
    view: NotificationView;
    limit?: number;
  },
): Promise<NotificationItem[]> {
  let query = supabase
    .from('record_notifications')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('recipient_user_id', input.viewerId)
    .order('created_at', { ascending: false });

  if (input.view === 'unread') {
    query = query.is('archived_at', null).is('read_at', null);
  } else if (input.view === 'archived') {
    query = query.not('archived_at', 'is', null);
  } else {
    query = query.is('archived_at', null);
  }

  const { data, error } =
    typeof input.limit === 'number' ? await query.limit(input.limit) : await query;

  if (error) {
    throw new Error(error.message);
  }

  if (data.length === 0) {
    return [];
  }

  const branchNames = await loadLocationNameMap(
    supabase,
    data.map((row) => row.location_id),
  );

  return data.map((row) => toNotificationItem(row, branchNames));
}

export async function getNotificationCountsFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
  },
) {
  const [allResult, unreadResult, archivedResult] = await Promise.all([
    supabase
      .from('record_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', input.tenantId)
      .eq('recipient_user_id', input.viewerId)
      .is('archived_at', null),
    supabase
      .from('record_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', input.tenantId)
      .eq('recipient_user_id', input.viewerId)
      .is('archived_at', null)
      .is('read_at', null),
    supabase
      .from('record_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', input.tenantId)
      .eq('recipient_user_id', input.viewerId)
      .not('archived_at', 'is', null),
  ]);

  if (allResult.error) {
    throw new Error(allResult.error.message);
  }

  if (unreadResult.error) {
    throw new Error(unreadResult.error.message);
  }

  if (archivedResult.error) {
    throw new Error(archivedResult.error.message);
  }

  return {
    totalCount: allResult.count ?? 0,
    unreadCount: unreadResult.count ?? 0,
    archivedCount: archivedResult.count ?? 0,
  };
}

export async function markNotificationReadInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
    notificationId: string;
  },
) {
  const { error } = await supabase
    .from('record_notifications')
    .update({
      read_at: new Date().toISOString(),
    })
    .eq('organization_id', input.tenantId)
    .eq('recipient_user_id', input.viewerId)
    .eq('id', input.notificationId)
    .is('archived_at', null)
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsReadInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
  },
) {
  const { error } = await supabase
    .from('record_notifications')
    .update({
      read_at: new Date().toISOString(),
    })
    .eq('organization_id', input.tenantId)
    .eq('recipient_user_id', input.viewerId)
    .is('archived_at', null)
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setNotificationArchivedStateInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    viewerId: string;
    notificationId: string;
    isArchived: boolean;
  },
) {
  const { data, error } = await supabase
    .from('record_notifications')
    .update({
      archived_at: input.isArchived ? new Date().toISOString() : null,
      read_at: input.isArchived ? new Date().toISOString() : null,
    })
    .eq('organization_id', input.tenantId)
    .eq('recipient_user_id', input.viewerId)
    .eq('id', input.notificationId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function createRecordNotifications(input: {
  supabase: SupabaseClient<Database>;
  target: CollaborationTarget;
  actorUserId: string;
  title: string;
  body: string;
  eventType: DatabaseNotificationEvent;
  recipientUserIds?: string[];
  excludeRecipientUserIds?: string[];
}) {
  const { data: watcherRows, error: watcherError } = await input.supabase
    .from('record_watchers')
    .select('user_id')
    .eq('organization_id', input.target.organizationId)
    .eq('entity_type', input.target.entityType)
    .eq('entity_id', input.target.entityId)
    .eq('is_muted', false);

  if (watcherError) {
    throw new Error(watcherError.message);
  }

  const recipientIds = Array.from(
    new Set([
      ...watcherRows.map((row) => row.user_id),
      ...(input.recipientUserIds ?? []),
    ]),
  ).filter(
    (recipientUserId) =>
      recipientUserId !== input.actorUserId &&
      !(input.excludeRecipientUserIds ?? []).includes(recipientUserId),
  );

  if (recipientIds.length === 0) {
    return;
  }

  const href = getRecordDetailPath(input.target.entityType, input.target.entityId);
  const { error } = await input.supabase.from('record_notifications').insert(
    recipientIds.map((recipientUserId) => ({
      organization_id: input.target.organizationId,
      location_id: input.target.locationId,
      entity_type: input.target.entityType,
      entity_id: input.target.entityId,
      event_type: input.eventType,
      recipient_user_id: recipientUserId,
      actor_user_id: input.actorUserId,
      title: input.title,
      body: input.body,
      href,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}
