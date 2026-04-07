'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { isServerActionRateLimited } from '@/lib/security/action-rate-limit';
import { canDeleteRecordComment } from '@/features/collaboration/lib/collaboration-permissions';
import { getSafeRecordReturnPath } from '@/features/collaboration/lib/get-safe-record-return-path';
import { softDeleteRecordCommentInDb } from '@/features/collaboration/repositories/collaboration.repository';
import { deleteRecordCommentSchema } from '@/features/collaboration/schemas/record-comment.schema';

export async function deleteRecordCommentAction(formData: FormData) {
  const parsed = deleteRecordCommentSchema.safeParse({
    commentId: formData.get('commentId'),
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    returnPath: formData.get('returnPath'),
  });

  if (!parsed.success) {
    return;
  }

  const context = await requireTenantMember();

  if (
    await isServerActionRateLimited({
      bucket: 'collaboration:delete-comment',
      actorId: context.viewerId,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: comment, error } = await supabase
    .from('record_comments')
    .select('author_user_id')
    .eq('organization_id', context.tenantId)
    .eq('id', parsed.data.commentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (
    !comment ||
    !canDeleteRecordComment(
      context.viewerId,
      comment.author_user_id,
      context.membershipRole,
    )
  ) {
    return;
  }

  await softDeleteRecordCommentInDb(supabase, {
    tenantId: context.tenantId,
    commentId: parsed.data.commentId,
  });

  const returnPath = getSafeRecordReturnPath(
    parsed.data.entityType,
    parsed.data.entityId,
    parsed.data.returnPath,
  );

  revalidatePath(returnPath);
  redirect(returnPath);
}
