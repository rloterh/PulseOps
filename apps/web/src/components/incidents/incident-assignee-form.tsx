'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { assignIncidentAction } from '@/actions/incidents/assign-incident-action';
import type { CreateIncidentActionState } from '@/features/incidents/types/incident.types';
import type { MemberOption } from '@/lib/organizations/get-member-options';

const initialState: CreateIncidentActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving assignee...' : 'Save assignee'}
    </button>
  );
}

export function IncidentAssigneeForm({
  incidentId,
  currentAssigneeUserId,
  assignees,
}: {
  incidentId: string;
  currentAssigneeUserId: string | null;
  assignees: MemberOption[];
}) {
  const [state, formAction] = useActionState(assignIncidentAction, initialState);

  return (
    <form
      action={formAction}
      className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5"
    >
      <h2 className="text-lg font-semibold tracking-tight text-white">Assign assignee</h2>
      <input type="hidden" name="incidentId" value={incidentId} />
      <div className="mt-4 space-y-3">
        <select
          name="assigneeUserId"
          defaultValue={currentAssigneeUserId ?? ''}
          className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
        >
          <option value="">Unassigned</option>
          {assignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.label}
            </option>
          ))}
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
