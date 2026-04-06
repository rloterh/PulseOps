'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { insertTimelineEvent } from '@/features/timeline/repositories/timeline.repository';
import { canUseInternalNotes } from '@/features/collaboration/lib/collaboration-permissions';
import { getSafeRecordReturnPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import {
  extractMentionTokens,
  stripMentionMarkup,
} from '@/features/collaboration/lib/mention-markup';
import {
  ensureRecordWatchersInDb,
  getCollaborationTargetFromDb,
  insertRecordCommentInDb,
  insertRecordCommentMentionsInDb,
} from '@/features/collaboration/repositories/collaboration.repository';
import { createRecordCommentSchema } from '@/features/collaboration/schemas/record-comment.schema';
import type { CommentActionState } from '@/features/collaboration/types/collaboration.types';

const initialError = 'Provide valid comment details before submitting.';

function getTimelineCommentTitle(kind: 'comment' | 'internal_note') {
  return kind === 'internal_note' ? 'Internal note added' : 'Comment added';
}

export async function createRecordCommentAction(
  _previousState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const parsed = createRecordCommentSchema.safeParse({
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    parentCommentId: formData.get('parentCommentId'),
    kind: formData.get('kind'),
    body: formData.get('body'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? initialError,
    };
  }

  const context = await requireTenantMember();

  if (
    parsed.data.kind === 'internal_note' &&
    !canUseInternalNotes(context.membershipRole)
  ) {
    return {
      error: 'Only workspace leads can add internal notes.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const target = await getCollaborationTargetFromDb(supabase, {
    tenantId: context.tenantId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
  });

  if (!target) {
    return {
      error: 'This record is no longer available.',
    };
  }

  const mentionTokens = extractMentionTokens(parsed.data.body);
  const memberOptions = await getMemberOptions(context.tenantId, target.locationId);
  const validMentionIds = new Set(memberOptions.map((member) => member.id));
  const invalidMention = mentionTokens.find((mention) => !validMentionIds.has(mention.userId));

  if (invalidMention) {
    return {
      error: `${invalidMention.label} is no longer available in this branch directory.`,
    };
  }

  const inserted = await insertRecordCommentInDb(supabase, {
    target,
    parentCommentId: parsed.data.parentCommentId,
    authorUserId: context.viewerId,
    kind: parsed.data.kind,
    body: parsed.data.body,
    bodyText: stripMentionMarkup(parsed.data.body),
  });

  await insertRecordCommentMentionsInDb(supabase, {
    target,
    commentId: inserted.id,
    mentionedByUserId: context.viewerId,
    mentionedUserIds: mentionTokens.map((mention) => mention.userId),
  });

  await ensureRecordWatchersInDb(supabase, {
    target,
    watchers: [
      {
        userId: context.viewerId,
        source: 'participant',
      },
      ...mentionTokens.map((mention) => ({
        userId: mention.userId,
        source: 'participant' as const,
      })),
    ],
  });

  await insertTimelineEvent(supabase, {
    kind: parsed.data.entityType,
    tenantId: context.tenantId,
    parentId: parsed.data.entityId,
    eventType: 'note',
    title: getTimelineCommentTitle(parsed.data.kind),
    description:
      parsed.data.kind === 'internal_note'
        ? `${context.viewerName} added an internal note to ${target.reference}.`
        : `${context.viewerName} added a comment to ${target.reference}.`,
    actorUserId: context.viewerId,
    actorName: context.viewerName,
  });

  const returnPath = getSafeRecordReturnPath(
    parsed.data.entityType,
    parsed.data.entityId,
    parsed.data.returnPath,
  );

  revalidatePath(returnPath);
  redirect(returnPath);
}
