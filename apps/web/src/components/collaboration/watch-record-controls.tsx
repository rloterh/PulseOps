import { toggleWatchMuteAction } from '@/features/collaboration/actions/toggle-watch-mute-action';
import { unwatchRecordAction } from '@/features/collaboration/actions/unwatch-record-action';
import { watchRecordAction } from '@/features/collaboration/actions/watch-record-action';
import type { RecordEntityType, RecordWatchState } from '@/features/collaboration/types/collaboration.types';

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

      <div className="mt-4 flex flex-wrap gap-2">
        {watchState.isWatching ? (
          <form action={unwatchRecordAction}>
            <input type="hidden" name="entityType" value={entityType} />
            <input type="hidden" name="entityId" value={entityId} />
            <input type="hidden" name="returnPath" value={returnPath} />
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Unwatch record
            </button>
          </form>
        ) : (
          <form action={watchRecordAction}>
            <input type="hidden" name="entityType" value={entityType} />
            <input type="hidden" name="entityId" value={entityId} />
            <input type="hidden" name="returnPath" value={returnPath} />
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Watch record
            </button>
          </form>
        )}

        {watchState.isWatching ? (
          <form action={toggleWatchMuteAction}>
            <input type="hidden" name="entityType" value={entityType} />
            <input type="hidden" name="entityId" value={entityId} />
            <input type="hidden" name="returnPath" value={returnPath} />
            <input
              type="hidden"
              name="isMuted"
              value={watchState.isMuted ? 'false' : 'true'}
            />
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-black/30 hover:text-white"
            >
              {watchState.isMuted ? 'Unmute watch' : 'Mute watch'}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
