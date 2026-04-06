'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { MemberOption } from '@/lib/organizations/get-member-options';
import { createRecordCommentAction } from '@/features/collaboration/actions/create-record-comment-action';
import { injectMentionMarkup } from '@/features/collaboration/lib/mention-markup';
import type {
  CommentActionState,
  RecordEntityType,
} from '@/features/collaboration/types/collaboration.types';

const initialState: CommentActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Posting...' : 'Post update'}
    </button>
  );
}

export function RecordCommentComposer({
  entityType,
  entityId,
  returnPath,
  canPostInternalNotes,
  mentionSuggestions,
}: {
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
  canPostInternalNotes: boolean;
  mentionSuggestions: MemberOption[];
}) {
  const [state, formAction] = useActionState(createRecordCommentAction, initialState);
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<'comment' | 'internal_note'>('comment');

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="parentCommentId" value="" />
      <input type="hidden" name="returnPath" value={returnPath} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setKind('comment');
          }}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] transition ${
            kind === 'comment'
              ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
              : 'border-white/10 bg-white/[0.04] text-white/58 hover:bg-white/[0.08]'
          }`}
        >
          Team comment
        </button>
        {canPostInternalNotes ? (
          <button
            type="button"
            onClick={() => {
              setKind('internal_note');
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] transition ${
              kind === 'internal_note'
                ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                : 'border-white/10 bg-white/[0.04] text-white/58 hover:bg-white/[0.08]'
            }`}
          >
            Internal note
          </button>
        ) : null}
      </div>

      <input type="hidden" name="kind" value={kind} />

      <div className="space-y-2">
        <label htmlFor={`comment-body-${entityId}`} className="text-sm font-medium text-white">
          {kind === 'internal_note' ? 'Internal note' : 'Comment'}
        </label>
        <textarea
          id={`comment-body-${entityId}`}
          name="body"
          rows={5}
          required
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
          }}
          placeholder={
            kind === 'internal_note'
              ? 'Capture the internal coordination detail that should stay inside the ops team.'
              : 'Share the latest update, handoff note, or blocker for the team.'
          }
          className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34"
        />
      </div>

      {mentionSuggestions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Mention a teammate
          </p>
          <div className="flex flex-wrap gap-2">
            {mentionSuggestions.slice(0, 8).map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  setBody((current) =>
                    injectMentionMarkup(current, {
                      userId: member.id,
                      label: member.label,
                    }),
                  );
                }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                @{member.label}
              </button>
            ))}
          </div>
          <p className="text-xs leading-5 text-white/42">
            Mentions are stored with the record now so notification fan-out can land cleanly in the next phase.
          </p>
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/34">
          Sprint 4C / collaboration
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
