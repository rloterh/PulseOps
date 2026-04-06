import type { Route } from 'next';
import Link from 'next/link';
import type { DirectoryUser } from '@/features/directory/types/directory.types';
import { EmptyState } from '@/components/shared/empty-state';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { CreateTaskForm } from '@/components/tasks/create-task-form';
import { canCreateTasks } from '@/features/tasks/lib/task-permissions';
import { getTaskLinkOptions } from '@/features/tasks/queries/get-task-link-options';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { getActiveBranchContext } from '@/lib/tenancy/get-active-branch-context';

export default async function NewTaskPage() {
  const context = await requireTenantMember();
  const shell = await getActiveBranchContext({ userId: context.viewerId });
  const defaultLocationId = shell.activeBranchId ?? shell.branches[0]?.id ?? null;

  if (!canCreateTasks(context.membershipRole)) {
    return (
      <main className="space-y-6">
        <ListPageHeader
          eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
          title="New task"
          description="Task intake is limited to active workspace members with execution access."
        />
        <EmptyState
          title="You do not have task intake access"
          description="Ask an owner, admin, or manager to create this task, or switch to a role that can add branch follow-up work."
          actionHref={'/tasks' as Route}
          actionLabel="Back to tasks"
        />
      </main>
    );
  }

  if (shell.branches.length === 0) {
    return (
      <main className="space-y-6">
        <ListPageHeader
          eyebrow={context.tenantName}
          title="New task"
          description="PulseOps needs at least one active branch before task intake can begin."
        />
        <EmptyState
          title="No active branches available"
          description="Create or reactivate a branch first, then return here to open the new task flow."
          actionHref="/branches"
          actionLabel="Open branches"
        />
      </main>
    );
  }

  const [initialAssignees, linkOptions] = await Promise.all([
    defaultLocationId ? getMemberOptions(context.tenantId, defaultLocationId) : [],
    getTaskLinkOptions({ tenantId: context.tenantId }),
  ]);

  const directoryUsers: DirectoryUser[] = initialAssignees.map((member) => ({
    userId: member.id,
    fullName: member.label,
    email: member.email,
    avatarUrl: member.avatarUrl,
    role: member.role as DirectoryUser['role'],
    isCurrentUser: member.isCurrentUser,
    locationId: defaultLocationId,
    locationName:
      shell.branches.find((branch) => branch.id === defaultLocationId)?.name ?? null,
  }));

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
        title="New task"
        description="Capture the small operational follow-ups that should sit alongside incidents and jobs instead of getting lost in side channels."
        actions={
          <Link
            href={'/tasks' as Route}
            className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to tasks
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
          <CreateTaskForm
            branches={shell.branches}
            defaultLocationId={defaultLocationId}
            initialAssignees={directoryUsers}
            linkOptions={linkOptions}
          />
        </article>

        <aside className="space-y-4">
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/72">
              Task intake
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              Link the small work to the bigger record
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              Tasks can stay standalone or connect directly to an incident or job in the same branch, so the follow-up work remains visible in the operating context.
            </p>
          </section>

          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              Create flow guardrails
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/56">
              <li>Linked records must belong to the selected branch</li>
              <li>Task references are generated server-side at submit time</li>
              <li>Creation writes immediate task timeline activity</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
