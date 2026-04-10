'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateIncidentAction } from '@/features/incidents/actions/update-incident-action';
import type {
  CreateIncidentActionState,
  IncidentEditRecord,
} from '@/features/incidents/types/incident.types';
import { DateTimePickerField } from '@/components/shared/date-time-picker-field';
import { toDateTimeLocalInputValue } from '@/lib/forms/to-date-time-local-input-value';

const initialState: CreateIncidentActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving incident...' : 'Save incident details'}
    </button>
  );
}

export function EditIncidentForm({ incident }: { incident: IncidentEditRecord }) {
  const [state, formAction] = useActionState(updateIncidentAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="incidentId" value={incident.id} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Branch</label>
          <div className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
            {incident.branchName}
          </div>
          <p className="text-xs leading-5 text-white/48">
            Branch stays fixed in this pass so edits remain easy to audit against the incident timeline.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="reportedAt" className="text-sm font-medium text-white">
            Reported at
          </label>
          <DateTimePickerField
            id="reportedAt"
            name="reportedAt"
            defaultValue={toDateTimeLocalInputValue(incident.reportedAt)}
            variant="reported"
            allowClear={false}
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-white">
            Incident title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={incident.title}
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
            defaultValue={incident.summary}
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
            defaultValue={incident.customerName}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="severity" className="text-sm font-medium text-white">
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            defaultValue={incident.severity}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/14 px-4 py-3 text-sm text-white lg:col-span-2">
          <input
            type="checkbox"
            name="slaRisk"
            value="true"
            defaultChecked={incident.slaRisk}
            className="size-4 rounded"
          />
          Mark as SLA at risk
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
            defaultValue={incident.impactSummary}
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none"
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
            defaultValue={incident.nextAction}
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none"
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
          Sprint 4B / incident edits
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
