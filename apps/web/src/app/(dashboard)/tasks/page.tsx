import type { Route } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { StatPill } from '@/components/shared/stat-pill';
import { TaskListTable } from '@/components/tasks/task-list-table';
import { canCreateTasks } from '@/features/tasks/lib/task-permissions';
import { getTasksList } from '@/features/tasks/queries/get-tasks-list';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export default async function TasksPage() {
  const context = await requireTenantMember();
  const tasks = await getTasksList({
    tenantId: context.tenantId,
    branchId: context.branchId,
  });
  const canCreate = canCreateTasks(context.membershipRole);
  const openCount = tasks.filter((task) =>
    ['todo', 'in_progress', 'blocked'].includes(task.status),
  ).length;
  const linkedCount = tasks.filter((task) => task.linkedRecordLabel).length;

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
        title="Tasks"
        description="Track follow-up work that keeps incidents and jobs moving, without losing the small operational actions between the bigger records."
        actions={
          <>
            <StatPill label={`${String(tasks.length)} total`} />
            <StatPill label={`${String(openCount)} open`} tone="warning" />
            <StatPill
              label={`${String(linkedCount)} linked`}
              tone={linkedCount > 0 ? 'success' : 'default'}
            />
            {canCreate ? (
              <Link
                href={'/tasks/new' as Route}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
              >
                New task
              </Link>
            ) : null}
          </>
        }
      />

      {tasks.length > 0 ? (
        <TaskListTable items={tasks} />
      ) : canCreate ? (
        <EmptyState
          title="No tasks are open in this view"
          description="Create a follow-up task for the current branch to keep smaller operational actions visible alongside incidents and jobs."
          actionHref={'/tasks/new' as Route}
          actionLabel="Create a task"
        />
      ) : (
        <EmptyState
          title="No tasks are open in this view"
          description="Create a follow-up task for the current branch to keep smaller operational actions visible alongside incidents and jobs."
        />
      )}
    </main>
  );
}
