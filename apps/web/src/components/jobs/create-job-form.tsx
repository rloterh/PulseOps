'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { BranchOption } from '@/features/shell/types/shell.types';
import type { DirectoryUser } from '@/features/directory/types/directory.types';
import type { CreateJobActionState } from '@/features/jobs/types/job.types';
import { createJobAction } from '@/features/jobs/actions/create-job-action';
import { AssigneeCombobox } from '@/components/directory/assignee-combobox';
import { DateTimePickerField } from '@/components/shared/date-time-picker-field';

const initialState: CreateJobActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Creating job...' : 'Create job'}
    </button>
  );
}

export function CreateJobForm({
  branches,
  defaultLocationId,
  initialAssignees,
}: {
  branches: BranchOption[];
  defaultLocationId: string | null;
  initialAssignees: DirectoryUser[];
}) {
  const [state, formAction] = useActionState(createJobAction, initialState);
  const [locationId, setLocationId] = useState(defaultLocationId ?? '');
  const selectedBranch = branches.find((branch) => branch.id === locationId) ?? null;

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="locationId" className="text-sm font-medium text-white">
            Branch
          </label>
          <select
            id="locationId"
            name="locationId"
            value={locationId}
            onChange={(event) => {
              setLocationId(event.target.value);
            }}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="" disabled>
              Select a branch
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <p className="text-xs leading-5 text-white/48">
            {selectedBranch
              ? `${selectedBranch.name} / ${selectedBranch.locationLabel ?? 'No location details yet'}`
              : 'Choose the operating branch for this job.'}
          </p>
        </div>

        <AssigneeCombobox
          name="assigneeUserId"
          label="Primary assignee"
          locationId={locationId || null}
          initialResults={initialAssignees}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-white">
            Job title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Emergency rooftop unit inspection"
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/34"
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
            placeholder="Describe the work needed, the immediate context, and any handoff notes the assignee should see before arriving on site."
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34"
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
            placeholder="North Hub Retail"
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/34"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dueAt" className="text-sm font-medium text-white">
            Due at
          </label>
          <DateTimePickerField
            id="dueAt"
            name="dueAt"
            variant="due"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium text-white">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
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
            defaultValue="reactive"
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
          Intake checklist
        </label>
        <textarea
          id="checklistSummary"
          name="checklistSummary"
          rows={4}
          placeholder="Capture the expected handoff, safety checks, access notes, or proof requirements."
          className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34"
        />
        <p className="text-xs leading-5 text-white/48">
          Jobs created here start in <span className="text-white">New</span> status and will receive an intake timeline event immediately.
        </p>
      </section>

      {state.error ? (
        <div className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/34">
          Sprint 4A1 / job intake
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
