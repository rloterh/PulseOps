import type { Database } from '@pulseops/supabase/types';

export type RecordEntityType = 'incident' | 'job' | 'task';

export type RecordCommentKind = 'comment' | 'internal_note' | 'system';

export interface MentionToken {
  userId: string;
  label: string;
}

export interface CollaborationComment {
  id: string;
  entityType: RecordEntityType;
  entityId: string;
  kind: RecordCommentKind;
  body: string;
  bodyText: string;
  authorUserId: string;
  authorName: string;
  createdAtLabel: string;
  isEdited: boolean;
  canDelete: boolean;
  mentions: MentionToken[];
}

export interface RecordWatchState {
  isWatching: boolean;
  isMuted: boolean;
}

export interface CollaborationTarget {
  entityType: RecordEntityType;
  entityId: string;
  organizationId: string;
  locationId: string;
  title: string;
  reference: string;
}

export interface CommentActionState {
  error?: string;
}

export interface CollaborationActionState {
  error?: string;
}

export type OrganizationRole = Database['public']['Enums']['organization_role'];
