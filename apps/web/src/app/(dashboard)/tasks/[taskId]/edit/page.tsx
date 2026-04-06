import type { Route } from 'next';
import Link from 'next/link';
import { EditTaskForm } from '@/components/tasks/edit-task-form';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { getTaskForEdit } from '@/features/tasks/queries/get-task-for-edit';
import { getTaskLinkOptions } from '@/features/tasks/queries/get-task-link-options';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const context = await requireTenantMember();
  const [task, linkOptions] = await Promise.all([
    getTaskForEdit({
      tenantId: context.tenantId,
      branchId: context.branchId,
      taskId,
    }),
    getTaskLinkOptions({ tenantId: context.tenantId }),
  ]);

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={`${task.branchName} branch`}
        title="Edit task"
        description="Keep follow-up work current while maintaining the record-to-record links around it."
        actions={
          <Link
            href={`/tasks/${task.id}` as Route}
            className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to task
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
          <EditTaskForm task={task} linkOptions={linkOptions} />
        </article>

        <aside className="space-y-4">
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/72">
              Follow-up work
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              Task edits stay in context
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              Link changes and completion-note updates are recorded so the small work does not disappear from the operational story around it.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
