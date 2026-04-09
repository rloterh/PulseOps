'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { acknowledgeIncidentEscalationAction } from '@/actions/incidents/acknowledge-incident-escalation-action';
import { createIncidentEscalationAction } from '@/actions/incidents/create-incident-escalation-action';
import {
  canAcknowledgeIncidentEscalation,
  canManageIncidentEscalations,
} from '@/features/incidents/lib/incident-escalation-permissions';
import type {
  IncidentEscalationActionState,
  IncidentEscalationEntry,
} from '@/features/incidents/types/incident.types';
import type { Database } from '@pulseops/supabase/types';
import type { MemberOption } from '@/lib/organizations/get-member-options';

const initialState: IncidentEscalationActionState = {};

function CreateSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Triggering escalation...' : 'Trigger escalation'}
    </button>
  );
}

function AcknowledgeSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Acknowledging...' : 'Acknowledge escalation'}
    </button>
  );
}

function EscalationCreateForm({
  incidentId,
  escalationLevel,
  assignees,
  currentAssigneeUserId,
}: {
  incidentId: string;
  escalationLevel: number;
  assignees: MemberOption[];
  currentAssigneeUserId: string | null;
}) {
  const [state, formAction] = useActionState(
    createIncidentEscalationAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <input type="hidden" name="incidentId" value={incidentId} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/68">
          <span>Escalation level</span>
          <select
            name="escalationLevel"
            defaultValue={String(Math.max(escalationLevel + 1, 1))}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/68">
          <span>Direct owner</span>
          <select
            name="targetUserId"
            defaultValue={currentAssigneeUserId ?? ''}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="">No direct owner</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/68">
          <span>Fallback role</span>
          <select
            name="targetRole"
            defaultValue=""
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="">No fallback role</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="agent">Agent</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/68">
          <span>Queue label</span>
          <input
            name="targetQueue"
            type="text"
            placeholder="Dispatch, Field ops, Major incident desk..."
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-white/68">
        <span>Reason</span>
        <textarea
          name="reason"
          rows={3}
          placeholder="Why this incident needs escalation right now"
          className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
        />
      </label>

      {state.error ? (
        <p className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      <CreateSubmitButton />
    </form>
  );
}

function EscalationAcknowledgeForm({
  incidentId,
  escalationId,
}: {
  incidentId: string;
  escalationId: string;
}) {
  const [state, formAction] = useActionState(
    acknowledgeIncidentEscalationAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="incidentId" value={incidentId} />
      <input type="hidden" name="escalationId" value={escalationId} />
      <AcknowledgeSubmitButton />
      {state.error ? (
        <p className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function IncidentEscalationPanel({
  incidentId,
  escalationLevel,
  escalations,
  assignees,
  currentAssigneeUserId,
  viewerId,
  viewerRole,
}: {
  incidentId: string;
  escalationLevel: number;
  escalations: IncidentEscalationEntry[];
  assignees: MemberOption[];
  currentAssigneeUserId: string | null;
  viewerId: string;
  viewerRole: Database['public']['Enums']['organization_role'];
}) {
  const canManage = canManageIncidentEscalations(viewerRole);

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Escalations</h2>
          <p className="mt-2 text-sm leading-6 text-white/52">
            Manual escalation is available to privileged operators, and direct escalation
            targets can acknowledge when they pick up the incident.
          </p>
        </div>
        <div className="rounded-[1rem] border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.18em] text-amber-200/78">
            Current level
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {escalationLevel > 0 ? `Level ${String(escalationLevel)}` : 'None'}
          </p>
        </div>
      </div>

      {canManage ? (
        <EscalationCreateForm
          incidentId={incidentId}
          escalationLevel={escalationLevel}
          assignees={assignees}
          currentAssigneeUserId={currentAssigneeUserId}
        />
      ) : null}

      <div className="mt-5 space-y-3">
        {escalations.length > 0 ? (
          escalations.map((escalation) => {
            const canAcknowledge = canAcknowledgeIncidentEscalation({
              role: viewerRole,
              viewerId,
              targetUserId: escalation.targetUserId,
            });

            return (
              <article
                key={escalation.id}
                className="rounded-[1.25rem] border border-white/8 bg-black/18 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Level {String(escalation.escalationLevel)} to {escalation.targetLabel}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                      {escalation.triggeredByName} / {escalation.triggeredAtLabel}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
                      escalation.status === 'acknowledged'
                        ? 'border border-emerald-400/25 bg-emerald-500/12 text-emerald-200'
                        : escalation.status === 'completed'
                          ? 'border border-sky-400/25 bg-sky-500/12 text-sky-200'
                          : 'border border-amber-400/25 bg-amber-500/12 text-amber-200'
                    }`}
                  >
                    {escalation.status}
                  </span>
                </div>

                {escalation.reason ? (
                  <p className="mt-3 text-sm leading-6 text-white/58">{escalation.reason}</p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-white/38">
                  {escalation.acknowledgedByName ? (
                    <span>
                      Acknowledged by {escalation.acknowledgedByName} /{' '}
                      {escalation.acknowledgedAtLabel}
                    </span>
                  ) : null}
                  {escalation.completedAtLabel ? (
                    <span>Completed / {escalation.completedAtLabel}</span>
                  ) : null}
                </div>

                {canAcknowledge &&
                (escalation.status === 'pending' || escalation.status === 'sent') ? (
                  <EscalationAcknowledgeForm
                    incidentId={incidentId}
                    escalationId={escalation.id}
                  />
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-black/12 p-4 text-sm leading-6 text-white/52">
            No escalation events have been recorded for this incident yet.
          </div>
        )}
      </div>
    </section>
  );
}
