'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AssigneeCombobox } from '@/components/directory/assignee-combobox';
import { createTaskAction } from '@/features/tasks/actions/create-task-action';
import type { DirectoryUser } from '@/features/directory/types/directory.types';
import type { BranchOption } from '@/features/shell/types/shell.types';
import type {
  CreateTaskActionState,
  TaskLinkOption,
} from '@/features/tasks/types/task.types';

const initialState: CreateTaskActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Creating task...' : 'Create task'}
    </button>
  );
}

export function CreateTaskForm({
  branches,
  defaultLocationId,
  initialAssignees,
  linkOptions,
}: {
  branches: BranchOption[];
  defaultLocationId: string | null;
  initialAssignees: DirectoryUser[];
  linkOptions: TaskLinkOption[];
}) {
  const [state, formAction] = useActionState(createTaskAction, initialState);
  const [locationId, setLocationId] = useState(defaultLocationId ?? '');
  const [linkedEntityKind, setLinkedEntityKind] = useState<'none' | 'incident' | 'job'>('none');
  const [linkedEntityId, setLinkedEntityId] = useState('');
  const selectedBranch = branches.find((branch) => branch.id === locationId) ?? null;
  const availableLinks = linkOptions.filter(
    (option) =>
      option.locationId === locationId &&
      (linkedEntityKind === 'none' ? false : option.entityType === linkedEntityKind),
  );

  useEffect(() => {
    const isValidSelection = availableLinks.some((option) => option.id === linkedEntityId);

    if (!isValidSelection) {
      setLinkedEntityId('');
    }
  }, [availableLinks, linkedEntityId]);

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
              : 'Choose the operating branch for this task.'}
          </p>
        </div>

        <AssigneeCombobox
          name="assigneeUserId"
          label="Task owner"
          locationId={locationId || null}
          initialResults={initialAssignees}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-white">
            Task title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Confirm vendor arrival window"
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
            rows={4}
            placeholder="Describe the action that needs to happen and what good completion looks like."
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34"
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
          <label htmlFor="dueAt" className="text-sm font-medium text-white">
            Due at
          </label>
          <input
            id="dueAt"
            name="dueAt"
            type="datetime-local"
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="linkedEntityKind" className="text-sm font-medium text-white">
            Linked record type
          </label>
          <select
            id="linkedEntityKind"
            name="linkedEntityKind"
            value={linkedEntityKind}
            onChange={(event) => {
              setLinkedEntityKind(event.target.value as 'none' | 'incident' | 'job');
            }}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="none">No linked record</option>
            <option value="incident">Incident</option>
            <option value="job">Job</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedEntityId" className="text-sm font-medium text-white">
            Linked record
          </label>
          <select
            id="linkedEntityId"
            name="linkedEntityId"
            value={linkedEntityId}
            onChange={(event) => {
              setLinkedEntityId(event.target.value);
            }}
            disabled={linkedEntityKind === 'none'}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              {linkedEntityKind === 'none'
                ? 'Select a linked record type first'
                : availableLinks.length > 0
                  ? 'Choose a linked record'
                  : 'No records available for this branch'}
            </option>
            {availableLinks.map((option) => (
              <option key={option.id} value={option.id}>
                {option.reference} / {option.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-2">
        <label htmlFor="completionSummary" className="text-sm font-medium text-white">
          Completion note
        </label>
        <textarea
          id="completionSummary"
          name="completionSummary"
          rows={4}
          placeholder="Optional note the owner should capture if this task is expected to close quickly."
          className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34"
        />
      </section>

      {state.error ? (
        <div className="rounded-[1rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/34">
          Sprint 4A2 / task intake
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
