'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { toggleWatchMuteAction } from '@/features/collaboration/actions/toggle-watch-mute-action';
import { unwatchRecordAction } from '@/features/collaboration/actions/unwatch-record-action';
import { watchRecordAction } from '@/features/collaboration/actions/watch-record-action';
import type {
  CollaborationActionState,
  RecordEntityType,
  RecordWatchState,
} from '@/features/collaboration/types/collaboration.types';

const initialState: CollaborationActionState = {};

function WatchSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Updating watch...' : label}
    </button>
  );
}

function MuteSubmitButton({ isMuted }: { isMuted: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-black/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving watch...' : isMuted ? 'Unmute watch' : 'Mute watch'}
    </button>
  );
}

function WatchForm({
  entityType,
  entityId,
  returnPath,
}: {
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
}) {
  const [state, formAction] = useActionState(watchRecordAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <WatchSubmitButton label="Watch record" />
      {state.error ? (
        <p className="max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function UnwatchForm({
  entityType,
  entityId,
  returnPath,
}: {
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
}) {
  const [state, formAction] = useActionState(unwatchRecordAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <WatchSubmitButton label="Unwatch record" />
      {state.error ? (
        <p className="max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function ToggleMuteForm({
  entityType,
  entityId,
  returnPath,
  isMuted,
}: {
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
  isMuted: boolean;
}) {
  const [state, formAction] = useActionState(toggleWatchMuteAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <input type="hidden" name="isMuted" value={isMuted ? 'false' : 'true'} />
      <MuteSubmitButton isMuted={isMuted} />
      {state.error ? (
        <p className="max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function WatchRecordControls({
  entityType,
  entityId,
  returnPath,
  watchState,
}: {
  entityType: RecordEntityType;
  entityId: string;
  returnPath: string;
  watchState: RecordWatchState;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/72">Watching</p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
        Collaboration subscription
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/56">
        Follow this record so future comment and collaboration events can target you cleanly in the next notification phase.
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        {watchState.isWatching ? (
          <UnwatchForm
            entityType={entityType}
            entityId={entityId}
            returnPath={returnPath}
          />
        ) : (
          <WatchForm
            entityType={entityType}
            entityId={entityId}
            returnPath={returnPath}
          />
        )}

        {watchState.isWatching ? (
          <ToggleMuteForm
            entityType={entityType}
            entityId={entityId}
            returnPath={returnPath}
            isMuted={watchState.isMuted}
          />
        ) : null}
      </div>
    </section>
  );
}
