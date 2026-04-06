import type { Route } from 'next';
import Link from 'next/link';
import { JobPriorityBadge } from '@/components/jobs/job-priority-badge';
import type { TaskDetail } from '@/features/tasks/types/task.types';
import { TaskStatusBadge } from './task-status-badge';

export function TaskDetailHeader({ task }: { task: TaskDetail }) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(17,24,39,0.9),rgba(91,33,182,0.12))] px-6 py-7 shadow-[0_28px_90px_rgba(2,6,23,0.32)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <JobPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/56">
              {task.reference}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
              {task.branchName}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {task.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
              {task.summary}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] border border-white/8 bg-black/16 p-4 text-sm xl:min-w-[18rem]">
          <Link
            href={`/tasks/${task.id}/edit` as Route}
            className="inline-flex justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Edit task
          </Link>
          <DetailRow label="Created by" value={task.createdByName} />
          <DetailRow label="Assignee" value={task.assigneeName ?? 'Unassigned'} />
          <DetailRow label="Due" value={task.dueAtLabel} />
          <div>
            <dt className="text-white/42">Linked records</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {task.linkedIncident ? (
                <Link
                  href={`/incidents/${task.linkedIncident.id}` as Route}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/72 transition hover:bg-white/10 hover:text-white"
                >
                  {task.linkedIncident.reference}
                </Link>
              ) : null}
              {task.linkedJob ? (
                <Link
                  href={`/jobs/${task.linkedJob.id}` as Route}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/72 transition hover:bg-white/10 hover:text-white"
                >
                  {task.linkedJob.reference}
                </Link>
              ) : null}
              {!task.linkedIncident && !task.linkedJob ? (
                <span className="text-white/56">No linked record</span>
              ) : null}
            </dd>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/42">{label}</dt>
      <dd className="mt-1 font-medium text-white">{value}</dd>
    </div>
  );
}
