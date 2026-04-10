'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { DateTimePickerField } from '@/components/shared/date-time-picker-field';
import { updateTaskAction } from '@/features/tasks/actions/update-task-action';
import type {
  CreateTaskActionState,
  TaskEditRecord,
  TaskLinkOption,
} from '@/features/tasks/types/task.types';
import { toDateTimeLocalInputValue } from '@/lib/forms/to-date-time-local-input-value';

const initialState: CreateTaskActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving task...' : 'Save task details'}
    </button>
  );
}

export function EditTaskForm({
  task,
  linkOptions,
}: {
  task: TaskEditRecord;
  linkOptions: TaskLinkOption[];
}) {
  const [state, formAction] = useActionState(updateTaskAction, initialState);
  const [linkedEntityKind, setLinkedEntityKind] = useState(task.linkedEntityKind);
  const [linkedEntityId, setLinkedEntityId] = useState(task.linkedEntityId ?? '');

  const availableLinks = linkOptions.filter(
    (option) =>
      option.locationId === task.branchId &&
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
      <input type="hidden" name="taskId" value={task.id} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Branch</label>
          <div className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
            {task.branchName}
          </div>
          <p className="text-xs leading-5 text-white/48">
            Task edits keep the current branch fixed and only allow links within that branch.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="dueAt" className="text-sm font-medium text-white">
            Due at
          </label>
          <DateTimePickerField
            id="dueAt"
            name="dueAt"
            defaultValue={toDateTimeLocalInputValue(task.dueAt)}
            variant="due"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-white">
            Task title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={task.title}
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
            rows={4}
            defaultValue={task.summary}
            className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium text-white">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={task.priority}
            className="h-11 w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
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
          defaultValue={task.completionSummary}
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
          Sprint 4B / task edits
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
