'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { BranchOption } from '@/features/shell/types/shell.types';
import type { DirectoryUser } from '@/features/directory/types/directory.types';
import type { CreateIncidentActionState } from '@/features/incidents/types/incident.types';
import { createIncidentAction } from '@/features/incidents/actions/create-incident-action';
import { AssigneeCombobox } from '@/components/directory/assignee-combobox';
import { DateTimePickerField } from '@/components/shared/date-time-picker-field';

const initialState: CreateIncidentActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Reporting incident...' : 'Create incident'}
    </button>
  );
}

export function CreateIncidentForm({
  branches,
  defaultLocationId,
  initialAssignees,
}: {
  branches: BranchOption[];
  defaultLocationId: string | null;
  initialAssignees: DirectoryUser[];
}) {
  const [state, formAction] = useActionState(createIncidentAction, initialState);
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
              : 'Choose the operating branch for this incident.'}
          </p>
        </div>

        <AssigneeCombobox
          name="assigneeUserId"
          label="Response owner"
          locationId={locationId || null}
          initialResults={initialAssignees}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-white">
            Incident title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Cooling failure on north trading floor"
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
            placeholder="Capture what happened, what teams are seeing right now, and what the response lead needs to know immediately."
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
          <label htmlFor="reportedAt" className="text-sm font-medium text-white">
            Reported at
          </label>
          <DateTimePickerField
            id="reportedAt"
            name="reportedAt"
            variant="reported"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="severity" className="text-sm font-medium text-white">
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            defaultValue="high"
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/14 px-4 py-3 text-sm text-white">
          <input type="checkbox" name="slaRisk" value="true" className="size-4 rounded" />
          Mark as SLA at risk from intake
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="impactSummary" className="text-sm font-medium text-white">
            Impact summary
          </label>
          <textarea
            id="impactSummary"
            name="impactSummary"
            rows={4}
            placeholder="What is affected right now, who is exposed, and what business impact is emerging?"
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="nextAction" className="text-sm font-medium text-white">
            Next action
          </label>
          <textarea
            id="nextAction"
            name="nextAction"
            rows={4}
            placeholder="Capture the immediate follow-up the response owner should execute next."
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34"
          />
        </div>
      </section>

      {state.error ? (
        <div className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/34">
          Sprint 4A2 / incident intake
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
