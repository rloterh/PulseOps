'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ListViewControls } from '@/components/shared/list-view-controls';
import type { JobListFilters, JobListItem, JobListSortField } from '@/features/jobs/types/job.types';
import {
  getJobListSortDirection,
  serializeJobListFilters,
  toggleJobListSort,
} from '@/features/jobs/lib/job-list-query-state';
import type { ListViewPreferenceOptions } from '@/features/operations-list/lib/list-view-preferences';
import { useRecordRowOpen } from '@/hooks/use-record-row-open';
import { usePersistentListViewPreferences } from '@/hooks/use-persistent-list-view-preferences';
import { formatTokenLabel } from '@/lib/formatting/format-token-label';
import { JobBulkStatusToolbar } from './job-bulk-status-toolbar';
import { JobPriorityBadge } from './job-priority-badge';
import { JobStatusBadge } from './job-status-badge';

type JobListColumn = 'branch' | 'priority' | 'status' | 'assignee' | 'due';

const JOB_LIST_COLUMNS: readonly { id: JobListColumn; label: string }[] = [
  { id: 'branch', label: 'Branch' },
  { id: 'priority', label: 'Priority' },
  { id: 'status', label: 'Status' },
  { id: 'assignee', label: 'Assignee' },
  { id: 'due', label: 'Due' },
];

const JOB_LIST_PREFERENCE_OPTIONS: ListViewPreferenceOptions<JobListColumn> = {
  allowedColumns: JOB_LIST_COLUMNS.map((column) => column.id),
  defaultVisibleColumns: JOB_LIST_COLUMNS.map((column) => column.id),
  defaultPageSize: 25,
};

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
  canManage,
}: {
  items: JobListItem[];
  filters: JobListFilters;
  canManage: boolean;
}) {
  const { openRecord } = useRecordRowOpen();
  const { preferences, setDensity, setPageSize, toggleColumn } =
    usePersistentListViewPreferences(
      'pulseops:list-view:jobs',
      JOB_LIST_PREFERENCE_OPTIONS,
    );
  const visibleItems =
    preferences.pageSize === 'all'
      ? items
      : items.slice(0, preferences.pageSize);
  const compactRows = preferences.density === 'compact';
  const rowPaddingClass = compactRows ? 'px-5 py-3' : 'px-5 py-4';
  const cardPaddingClass = compactRows ? 'p-3.5' : 'p-4';
  const visibleColumns = preferences.visibleColumns;
  const showBranch = visibleColumns.includes('branch');
  const showPriority = visibleColumns.includes('priority');
  const showStatus = visibleColumns.includes('status');
  const showAssignee = visibleColumns.includes('assignee');
  const showDue = visibleColumns.includes('due');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  useEffect(() => {
    const visibleIdSet = new Set(visibleItems.map((item) => item.id));

    setSelectedIds((current) =>
      current.filter((selectedId) => visibleIdSet.has(selectedId)),
    );
  }, [visibleItems]);

  function toggleSelection(jobId: string) {
    setSelectedIds((current) =>
      current.includes(jobId)
        ? current.filter((selectedId) => selectedId !== jobId)
        : [...current, jobId],
    );
  }

  function toggleAllVisible() {
    const visibleIds = visibleItems.map((item) => item.id);

    setSelectedIds((current) =>
      visibleIds.every((jobId) => current.includes(jobId)) ? [] : visibleIds,
    );
  }

  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
      <ListViewControls
        itemLabel="jobs"
        visibleCount={visibleItems.length}
        totalCount={items.length}
        density={preferences.density}
        onDensityChange={setDensity}
        pageSize={preferences.pageSize}
        onPageSizeChange={setPageSize}
        columns={JOB_LIST_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />
      {canManage ? (
        <JobBulkStatusToolbar
          selectedIds={selectedIds}
          onClearSelection={() => {
            setSelectedIds([]);
          }}
        />
      ) : null}

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-white/8">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/40">
              {canManage ? (
                <th className="px-5 py-4 font-medium">
                  <input
                    type="checkbox"
                    checked={
                      visibleItems.length > 0 &&
                      visibleItems.every((item) => selectedIds.includes(item.id))
                    }
                    onChange={toggleAllVisible}
                    aria-label="Select visible jobs"
                    className="h-4 w-4 accent-white"
                  />
                </th>
              ) : null}
              <th className="px-5 py-4 font-medium">
                <SortHeaderButton label="Job" field="title" filters={filters} />
              </th>
              {showBranch ? (
                <th className="px-5 py-4 font-medium">Branch</th>
              ) : null}
              {showPriority ? (
                <th className="px-5 py-4 font-medium">
                  <SortHeaderButton
                    label="Priority"
                    field="priority"
                    filters={filters}
                  />
                </th>
              ) : null}
              {showStatus ? (
                <th className="px-5 py-4 font-medium">
                  <SortHeaderButton label="Status" field="status" filters={filters} />
                </th>
              ) : null}
              {showAssignee ? (
                <th className="px-5 py-4 font-medium">Assignee</th>
              ) : null}
              {showDue ? (
                <th className="px-5 py-4 font-medium">
                  <SortHeaderButton label="Due" field="due_at" filters={filters} />
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 text-sm">
            {visibleItems.map((item) => (
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
                {canManage ? (
                  <td className={`${rowPaddingClass} align-top`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => {
                        toggleSelection(item.id);
                      }}
                      aria-label={`Select ${item.title}`}
                      className="mt-1 h-4 w-4 accent-white"
                    />
                  </td>
                ) : null}
                <td className={`${rowPaddingClass} align-top`}>
                  <div className="block">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                      {item.reference} / {item.siteName}
                    </p>
                  </div>
                </td>
                {showBranch ? (
                  <td className={`${rowPaddingClass} align-top text-white/68`}>
                    {item.branchName}
                  </td>
                ) : null}
                {showPriority ? (
                  <td className={`${rowPaddingClass} align-top`}>
                    <JobPriorityBadge priority={item.priority} />
                  </td>
                ) : null}
                {showStatus ? (
                  <td className={`${rowPaddingClass} align-top`}>
                    <div className="flex flex-col gap-2">
                      <JobStatusBadge status={item.status} />
                      <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                        {formatTokenLabel(item.type)}
                      </span>
                    </div>
                  </td>
                ) : null}
                {showAssignee ? (
                  <td className={`${rowPaddingClass} align-top text-white/68`}>
                    {item.assigneeName ?? 'Unassigned'}
                  </td>
                ) : null}
                {showDue ? (
                  <td className={`${rowPaddingClass} align-top text-white/68`}>
                    {item.dueAtLabel}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {visibleItems.map((item) => (
          <article
            key={item.id}
            className={`rounded-[1.4rem] border border-white/8 bg-black/18 transition hover:bg-black/26 ${cardPaddingClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/jobs/${item.id}` as Route} className="min-w-0 flex-1">
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                  {item.reference} / {item.siteName}
                </p>
              </Link>
              <div className="flex items-start gap-3">
                {canManage ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => {
                      toggleSelection(item.id);
                    }}
                    aria-label={`Select ${item.title}`}
                    className="mt-1 h-4 w-4 accent-white"
                  />
                ) : null}
                {showPriority ? <JobPriorityBadge priority={item.priority} /> : null}
              </div>
            </div>
            {(showStatus || showBranch) ? (
              <Link
                href={`/jobs/${item.id}` as Route}
                className="mt-4 flex flex-wrap gap-2"
              >
                {showStatus ? <JobStatusBadge status={item.status} /> : null}
                {showBranch ? (
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/60">
                    {item.branchName}
                  </span>
                ) : null}
              </Link>
            ) : null}
            {(showAssignee || showStatus) ? (
              <Link
                href={`/jobs/${item.id}` as Route}
                className="mt-4 block text-sm text-white/52"
              >
                {showAssignee ? (item.assigneeName ?? 'Unassigned') : formatTokenLabel(item.type)}
                {showAssignee && showStatus ? ' / ' : null}
                {showStatus ? formatTokenLabel(item.type) : null}
              </Link>
            ) : null}
            {showDue ? (
              <Link
                href={`/jobs/${item.id}` as Route}
                className="mt-2 block text-xs text-white/42"
              >
                {item.dueAtLabel}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
