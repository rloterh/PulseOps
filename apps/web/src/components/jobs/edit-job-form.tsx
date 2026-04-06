'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateJobAction } from '@/features/jobs/actions/update-job-action';
import type { CreateJobActionState, JobEditRecord } from '@/features/jobs/types/job.types';
import { toDateTimeLocalInputValue } from '@/lib/forms/to-date-time-local-input-value';

const initialState: CreateJobActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving job...' : 'Save job details'}
    </button>
  );
}

export function EditJobForm({ job }: { job: JobEditRecord }) {
  const [state, formAction] = useActionState(updateJobAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="jobId" value={job.id} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Branch</label>
          <div className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
            {job.branchName}
          </div>
          <p className="text-xs leading-5 text-white/48">
            Branch changes stay out of `4B` so edit history is safer and easier to trace.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="dueAt" className="text-sm font-medium text-white">
            Due at
          </label>
          <input
            id="dueAt"
            name="dueAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalInputValue(job.dueAt)}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-white">
            Job title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={job.title}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="summary" className="text-sm font-medium text-white">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            required
            rows={5}
            defaultValue={job.summary}
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="customerName" className="text-sm font-medium text-white">
            Customer name
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            required
            defaultValue={job.customerName}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium text-white">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={job.priority}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-white">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={job.type}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="reactive">Reactive</option>
            <option value="preventive">Preventive</option>
            <option value="inspection">Inspection</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
      </section>

      <section className="space-y-2">
        <label htmlFor="checklistSummary" className="text-sm font-medium text-white">
          Checklist summary
        </label>
        <textarea
          id="checklistSummary"
          name="checklistSummary"
          rows={4}
          defaultValue={job.checklistSummary}
          className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none"
        />
      </section>

      <section className="space-y-2">
        <label htmlFor="resolutionSummary" className="text-sm font-medium text-white">
          Resolution summary
        </label>
        <textarea
          id="resolutionSummary"
          name="resolutionSummary"
          rows={4}
          defaultValue={job.resolutionSummary}
          className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none"
        />
      </section>

      {state.error ? (
        <div className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/34">
          Sprint 4B / job edits
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
