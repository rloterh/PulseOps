'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  bulkUpdateJobStatusAction,
  type BulkJobStatusActionState,
} from '@/actions/jobs/bulk-update-job-status-action';

const initialState: BulkJobStatusActionState = {};

function BulkSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Updating...' : 'Apply'}
    </button>
  );
}

export function JobBulkStatusToolbar({
  selectedIds,
  onClearSelection,
}: {
  selectedIds: string[];
  onClearSelection: () => void;
}) {
  const [state, formAction] = useActionState(
    bulkUpdateJobStatusAction,
    initialState,
  );
  const [status, setStatus] = useState('scheduled');

  useEffect(() => {
    if (state.success) {
      onClearSelection();
    }
  }, [onClearSelection, state.success]);

  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-4 lg:px-5">
        <p className="text-sm text-white/42">
          Select visible jobs to update their status in one pass.
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-white/8 px-4 py-4 lg:px-5">
      <form action={formAction} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input type="hidden" name="jobIdsPayload" value={JSON.stringify(selectedIds)} />

        <div>
          <p className="text-sm font-medium text-white">
            {String(selectedIds.length)} job{selectedIds.length === 1 ? '' : 's'} selected
          </p>
          {state.error ? (
            <p className="mt-1 text-sm text-red-200">{state.error}</p>
          ) : state.success ? (
            <p className="mt-1 text-sm text-emerald-200">{state.success}</p>
          ) : (
            <p className="mt-1 text-sm text-white/46">
              Apply the same operational status to the current selection.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            name="status"
            value={status}
            onChange={(event) => {
              setStatus(event.currentTarget.value);
            }}
            className="h-10 min-w-[11rem] rounded-full border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="new">New</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/72 transition hover:bg-black/28 hover:text-white"
          >
            Clear
          </button>
          <BulkSubmitButton />
        </div>
      </form>
    </div>
  );
}
