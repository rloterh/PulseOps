'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteRecordCommentAction } from '@/features/collaboration/actions/delete-record-comment-action';
import type {
  CollaborationActionState,
  CollaborationComment,
  RecordEntityType,
} from '@/features/collaboration/types/collaboration.types';
import { CommentBody } from './comment-body';

const initialState: CollaborationActionState = {};

function DeleteCommentButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Removing...' : 'Remove'}
    </button>
  );
}

function DeleteCommentForm({
  commentId,
  entityType,
  entityId,
  returnPath,
}: {
  commentId: string;
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
}) {
  const [state, formAction] = useActionState(deleteRecordCommentAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <DeleteCommentButton />
      {state.error ? (
        <p className="max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function RecordCommentFeed({
  entityType,
  entityId,
  returnPath,
  comments,
}: {
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
  comments: CollaborationComment[];
}) {
  if (comments.length === 0) {
    return (
      <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-black/12 p-5 text-sm leading-6 text-white/52">
        No collaborative activity has been recorded on this record yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="rounded-[1.35rem] border border-white/8 bg-black/18 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{comment.authorName}</p>
                <span className="text-xs uppercase tracking-[0.16em] text-white/38">
                  {comment.createdAtLabel}
                </span>
                {comment.kind === 'internal_note' ? (
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                    Internal note
                  </span>
                ) : null}
                {comment.isEdited ? (
                  <span className="text-xs uppercase tracking-[0.16em] text-white/34">
                    Edited
                  </span>
                ) : null}
              </div>
            </div>

            {comment.canDelete ? (
              <DeleteCommentForm
                commentId={comment.id}
                entityType={entityType}
                entityId={entityId}
                returnPath={returnPath}
              />
            ) : null}
          </div>

          <div className="mt-3">
            <CommentBody body={comment.body} />
          </div>
        </article>
      ))}
    </div>
  );
}
