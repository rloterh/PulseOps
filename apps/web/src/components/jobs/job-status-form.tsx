'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateJobStatusAction } from '@/actions/jobs/update-job-status-action';
import type { CreateJobActionState, JobStatus } from '@/features/jobs/types/job.types';

const initialState: CreateJobActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving status...' : 'Save status'}
    </button>
  );
}

export function JobStatusForm({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: JobStatus;
}) {
  const [state, formAction] = useActionState(updateJobStatusAction, initialState);

  return (
    <form
      action={formAction}
      className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5"
    >
      <h2 className="text-lg font-semibold tracking-tight text-white">Update status</h2>
      <input type="hidden" name="jobId" value={jobId} />
      <div className="mt-4 space-y-3">
        <select
          name="status"
          defaultValue={currentStatus}
          className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
        >
          <option value="new">New</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {state.error ? (
          <p className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </p>
        ) : null}
        <SubmitButton />
      </div>
    </form>
  );
}
