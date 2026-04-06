import { TaskAssigneeForm } from '@/components/tasks/task-assignee-form';
import { TaskDetailHeader } from '@/components/tasks/task-detail-header';
import { TaskStatusForm } from '@/components/tasks/task-status-form';
import { TaskTimeline } from '@/components/tasks/task-timeline';
import { getTaskById } from '@/features/tasks/queries/get-task-by-id';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const context = await requireTenantMember();
  const task = await getTaskById({
    tenantId: context.tenantId,
    branchId: context.branchId,
    taskId,
  });
  const assignees = await getMemberOptions(context.tenantId, task.branchId);

  return (
    <main className="space-y-6">
      <TaskDetailHeader task={task} />

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <TaskTimeline items={task.timeline} />
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <TaskStatusForm taskId={task.id} currentStatus={task.status} />
          <TaskAssigneeForm
            taskId={task.id}
            currentAssigneeUserId={task.currentAssigneeUserId}
            assignees={assignees}
          />
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold tracking-tight text-white">Execution</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-white/42">Status</dt>
                <dd className="mt-1 font-medium text-white">{task.status.replaceAll('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-white/42">Priority</dt>
                <dd className="mt-1 font-medium text-white">{task.priority}</dd>
              </div>
              <div>
                <dt className="text-white/42">Due</dt>
                <dd className="mt-1 font-medium text-white">{task.dueAtLabel}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold tracking-tight text-white">Completion note</h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              {task.completionSummary ?? 'No completion note has been captured for this task yet.'}
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
