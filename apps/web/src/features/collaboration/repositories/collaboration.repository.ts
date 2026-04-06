import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@pulseops/supabase/types';
import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import { loadProfileLabelMap } from '@/lib/data/load-label-maps';
import type {
  CollaborationComment,
  CollaborationTarget,
  MentionToken,
  RecordCommentKind,
  RecordEntityType,
  RecordWatchState,
} from '@/features/collaboration/types/collaboration.types';
import { canDeleteRecordComment } from '@/features/collaboration/lib/collaboration-permissions';

interface TargetInput {
  tenantId: string;
  entityType: RecordEntityType;
  entityId: string;
}

export async function getCollaborationTargetFromDb(
  supabase: SupabaseClient<Database>,
  input: TargetInput,
): Promise<CollaborationTarget | null> {
  if (input.entityType === 'incident') {
    const { data, error } = await supabase
      .from('incidents')
      .select('id, organization_id, location_id, title, reference')
      .eq('organization_id', input.tenantId)
      .eq('id', input.entityId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return {
      entityType: input.entityType,
      entityId: data.id,
      organizationId: data.organization_id,
      locationId: data.location_id,
      title: data.title,
      reference: data.reference,
    };
  }

  if (input.entityType === 'job') {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, organization_id, location_id, title, reference')
      .eq('organization_id', input.tenantId)
      .eq('id', input.entityId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return {
      entityType: input.entityType,
      entityId: data.id,
      organizationId: data.organization_id,
      locationId: data.location_id,
      title: data.title,
      reference: data.reference,
    };
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('id, organization_id, location_id, title, reference')
    .eq('organization_id', input.tenantId)
    .eq('id', input.entityId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    entityType: input.entityType,
    entityId: data.id,
    organizationId: data.organization_id,
    locationId: data.location_id,
    title: data.title,
    reference: data.reference,
  };
}

export async function getRecordCommentsFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    entityType: RecordEntityType;
    entityId: string;
    viewerId: string;
    viewerRole: Database['public']['Enums']['organization_role'];
  },
): Promise<CollaborationComment[]> {
  const { data: comments, error } = await supabase
    .from('record_comments')
    .select('*')
    .eq('organization_id', input.tenantId)
    .eq('entity_type', input.entityType)
    .eq('entity_id', input.entityId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (comments.length === 0) {
    return [];
  }

  const [profileLabels, mentions] = await Promise.all([
    loadProfileLabelMap(
      supabase,
      comments.map((comment) => comment.author_user_id),
    ),
    loadMentionMap(supabase, comments.map((comment) => comment.id)),
  ]);

  return comments.map((comment) => ({
    id: comment.id,
    entityType: comment.entity_type as RecordEntityType,
    entityId: comment.entity_id,
    kind: comment.kind as RecordCommentKind,
    body: comment.body,
    bodyText: comment.body_text,
    authorUserId: comment.author_user_id,
    authorName: profileLabels.get(comment.author_user_id) ?? 'Unknown operator',
    createdAtLabel: formatDateTimeLabel(comment.created_at),
    isEdited: comment.is_edited,
    canDelete: canDeleteRecordComment(
      input.viewerId,
      comment.author_user_id,
      input.viewerRole,
    ),
    mentions: mentions.get(comment.id) ?? [],
  }));
}

export async function getRecordWatchStateFromDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    entityType: RecordEntityType;
    entityId: string;
    viewerId: string;
  },
): Promise<RecordWatchState> {
  const { data, error } = await supabase
    .from('record_watchers')
    .select('is_muted')
    .eq('organization_id', input.tenantId)
    .eq('entity_type', input.entityType)
    .eq('entity_id', input.entityId)
    .eq('user_id', input.viewerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    isWatching: Boolean(data),
    isMuted: data?.is_muted ?? false,
  };
}

export async function insertRecordCommentInDb(
  supabase: SupabaseClient<Database>,
  input: {
    target: CollaborationTarget;
    parentCommentId: string | null;
    authorUserId: string;
    kind: RecordCommentKind;
    body: string;
    bodyText: string;
  },
) {
  const { data, error } = await supabase
    .from('record_comments')
    .insert({
      organization_id: input.target.organizationId,
      location_id: input.target.locationId,
      entity_type: input.target.entityType,
      entity_id: input.target.entityId,
      parent_comment_id: input.parentCommentId,
      author_user_id: input.authorUserId,
      kind: input.kind,
      body: input.body,
      body_text: input.bodyText,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertRecordCommentMentionsInDb(
  supabase: SupabaseClient<Database>,
  input: {
    target: CollaborationTarget;
    commentId: string;
    mentionedByUserId: string;
    mentionedUserIds: string[];
  },
) {
  const uniqueIds = Array.from(new Set(input.mentionedUserIds));

  if (uniqueIds.length === 0) {
    return;
  }

  const { error } = await supabase.from('record_comment_mentions').insert(
    uniqueIds.map((userId) => ({
      organization_id: input.target.organizationId,
      location_id: input.target.locationId,
      entity_type: input.target.entityType,
      entity_id: input.target.entityId,
      comment_id: input.commentId,
      mentioned_user_id: userId,
      mentioned_by_user_id: input.mentionedByUserId,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function softDeleteRecordCommentInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    commentId: string;
  },
) {
  const { error } = await supabase
    .from('record_comments')
    .update({
      deleted_at: new Date().toISOString(),
      body: '[deleted]',
      body_text: '[deleted]',
      is_edited: false,
    })
    .eq('organization_id', input.tenantId)
    .eq('id', input.commentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function ensureRecordWatchersInDb(
  supabase: SupabaseClient<Database>,
  input: {
    target: CollaborationTarget;
    watchers: {
      userId: string;
      source: Database['public']['Tables']['record_watchers']['Insert']['source'];
    }[];
  },
) {
  const rows = Array.from(
    new Map(
      input.watchers
        .filter((watcher) => watcher.userId)
        .map((watcher) => [watcher.userId, watcher]),
    ).values(),
  );

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from('record_watchers').upsert(
    rows.map((watcher) => ({
      organization_id: input.target.organizationId,
      location_id: input.target.locationId,
      entity_type: input.target.entityType,
      entity_id: input.target.entityId,
      user_id: watcher.userId,
      ...(watcher.source ? { source: watcher.source } : {}),
    })),
    {
      onConflict: 'organization_id,entity_type,entity_id,user_id',
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function setRecordWatcherMuteStateInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    entityType: RecordEntityType;
    entityId: string;
    userId: string;
    isMuted: boolean;
  },
) {
  const { error } = await supabase
    .from('record_watchers')
    .update({
      is_muted: input.isMuted,
      muted_at: input.isMuted ? new Date().toISOString() : null,
    })
    .eq('organization_id', input.tenantId)
    .eq('entity_type', input.entityType)
    .eq('entity_id', input.entityId)
    .eq('user_id', input.userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeRecordWatcherInDb(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    entityType: RecordEntityType;
    entityId: string;
    userId: string;
  },
) {
  const { error } = await supabase
    .from('record_watchers')
    .delete()
    .eq('organization_id', input.tenantId)
    .eq('entity_type', input.entityType)
    .eq('entity_id', input.entityId)
    .eq('user_id', input.userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function loadMentionMap(
  supabase: SupabaseClient<Database>,
  commentIds: string[],
) {
  const uniqueCommentIds = Array.from(new Set(commentIds));

  if (uniqueCommentIds.length === 0) {
    return new Map<string, MentionToken[]>();
  }

  const { data, error } = await supabase
    .from('record_comment_mentions')
    .select('comment_id, mentioned_user_id')
    .in('comment_id', uniqueCommentIds);

  if (error) {
    throw new Error(error.message);
  }

  const profileLabels = await loadProfileLabelMap(
    supabase,
    data.map((row) => row.mentioned_user_id),
  );

  const map = new Map<string, MentionToken[]>();

  for (const row of data) {
    const current = map.get(row.comment_id) ?? [];
    current.push({
      userId: row.mentioned_user_id,
      label: profileLabels.get(row.mentioned_user_id) ?? 'Unknown operator',
    });
    map.set(row.comment_id, current);
  }

  return map;
}
