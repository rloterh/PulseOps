import { deleteRecordCommentAction } from '@/features/collaboration/actions/delete-record-comment-action';
import type { CollaborationComment, RecordEntityType } from '@/features/collaboration/types/collaboration.types';
import { CommentBody } from './comment-body';

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
              <form action={deleteRecordCommentAction}>
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="entityType" value={entityType} />
                <input type="hidden" name="entityId" value={entityId} />
                <input type="hidden" name="returnPath" value={returnPath} />
                <button
                  type="submit"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-white/64 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Remove
                </button>
              </form>
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
