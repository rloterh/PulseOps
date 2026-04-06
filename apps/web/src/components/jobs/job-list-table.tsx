'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { JobListFilters, JobListItem, JobListSortField } from '@/features/jobs/types/job.types';
import {
  getJobListSortDirection,
  serializeJobListFilters,
  toggleJobListSort,
} from '@/features/jobs/lib/job-list-query-state';
import { useRecordRowOpen } from '@/hooks/use-record-row-open';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { JobPriorityBadge } from './job-priority-badge';
import { JobStatusBadge } from './job-status-badge';

function SortHeaderButton({
  label,
  field,
  filters,
}: {
  label: string;
  field: JobListSortField;
  filters: JobListFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const direction = getJobListSortDirection(filters, field);

  return (
    <button
      type="button"
      onClick={() => {
        const next = serializeJobListFilters(toggleJobListSort(filters, field));
        const nextQuery = next.toString();

        if (nextQuery === searchParams.toString()) {
          return;
        }

        const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(href as Route, { scroll: false });
      }}
      className="inline-flex items-center gap-2 text-white/56 transition hover:text-white"
    >
      <span>{label}</span>
      {direction ? (
        <span className="text-[10px] tracking-[0.12em] text-white/32">
          {direction === 'asc' ? 'ASC' : 'DESC'}
        </span>
      ) : null}
    </button>
  );
}

export function JobListTable({
  items,
  filters,
}: {
  items: JobListItem[];
  filters: JobListFilters;
}) {
  const { openRecord } = useRecordRowOpen();

  function openJob(
    event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>,
    jobId: string,
  ) {
    const target = event.target as HTMLElement;
    const interactiveTarget = target.closest('button, input, a, select, textarea');

    if (interactiveTarget) {
      return;
    }

    const href = `/jobs/${jobId}` as Route;
    const newTab =
      'metaKey' in event
        ? event.metaKey || event.ctrlKey
        : false;

    openRecord(href, { newTab });
  }

  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-white/8">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/40">
              <th className="px-5 py-4 font-medium">
                <SortHeaderButton label="Job" field="title" filters={filters} />
              </th>
              <th className="px-5 py-4 font-medium">Branch</th>
              <th className="px-5 py-4 font-medium">
                <SortHeaderButton
                  label="Priority"
                  field="priority"
                  filters={filters}
                />
              </th>
              <th className="px-5 py-4 font-medium">
                <SortHeaderButton label="Status" field="status" filters={filters} />
              </th>
              <th className="px-5 py-4 font-medium">Assignee</th>
              <th className="px-5 py-4 font-medium">
                <SortHeaderButton label="Due" field="due_at" filters={filters} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 text-sm">
            {items.map((item) => (
              <tr
                key={item.id}
                tabIndex={0}
                onClick={(event) => {
                  openJob(event, item.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openJob(event, item.id);
                  }
                }}
                className="cursor-pointer transition hover:bg-white/[0.03] focus-visible:bg-white/[0.05] focus-visible:outline-none"
              >
                <td className="px-5 py-4 align-top">
                  <div className="block">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                      {item.reference} / {item.siteName}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4 align-top text-white/68">{item.branchName}</td>
                <td className="px-5 py-4 align-top">
                  <JobPriorityBadge priority={item.priority} />
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    <JobStatusBadge status={item.status} />
                    <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                      {formatTokenLabel(item.type)}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 align-top text-white/68">
                  {item.assigneeName ?? 'Unassigned'}
                </td>
                <td className="px-5 py-4 align-top text-white/68">{item.dueAtLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/jobs/${item.id}` as Route}
            className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4 transition hover:bg-black/26"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                  {item.reference} / {item.siteName}
                </p>
              </div>
              <JobPriorityBadge priority={item.priority} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <JobStatusBadge status={item.status} />
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/60">
                {item.branchName}
              </span>
            </div>
            <p className="mt-4 text-sm text-white/52">
              {item.assigneeName ?? 'Unassigned'} / {formatTokenLabel(item.type)}
            </p>
            <p className="mt-2 text-xs text-white/42">{item.dueAtLabel}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
