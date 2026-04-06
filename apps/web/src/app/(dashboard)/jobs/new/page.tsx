import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import { CreateJobForm } from '@/components/jobs/create-job-form';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getActiveBranchContext } from '@/lib/tenancy/get-active-branch-context';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { canCreateJobs } from '@/features/jobs/lib/jobs-permissions';

export default async function NewJobPage() {
  const context = await requireTenantMember();
  const shell = await getActiveBranchContext({ userId: context.viewerId });
  const defaultLocationId = shell.activeBranchId ?? shell.branches[0]?.id ?? null;

  if (!canCreateJobs(context.membershipRole)) {
    return (
      <main className="space-y-6">
        <ListPageHeader
          eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
          title="New job"
          description="Job intake is limited to workspace roles that can coordinate operational work."
        />
        <EmptyState
          title="You do not have job intake access"
          description="Ask an owner, admin, or manager to create this job, or switch to a workspace role with intake permissions."
          actionHref="/jobs"
          actionLabel="Back to jobs"
        />
      </main>
    );
  }

  if (shell.branches.length === 0) {
    return (
      <main className="space-y-6">
        <ListPageHeader
          eyebrow={context.tenantName}
          title="New job"
          description="PulseOps needs at least one active branch before intake can begin."
        />
        <EmptyState
          title="No active branches available"
          description="Create or reactivate a branch first, then return here to open the new job intake flow."
          actionHref="/branches"
          actionLabel="Open branches"
        />
      </main>
    );
  }

  const initialAssignees = defaultLocationId
    ? await getMemberOptions(context.tenantId, defaultLocationId)
    : [];

  const directoryUsers = initialAssignees.map((member) => ({
    userId: member.id,
    fullName: member.label,
    email: member.email,
    avatarUrl: member.avatarUrl,
    role: member.role as 'owner' | 'admin' | 'manager' | 'agent',
    isCurrentUser: member.isCurrentUser,
    locationId: defaultLocationId,
    locationName:
      shell.branches.find((branch) => branch.id === defaultLocationId)?.name ?? null,
  }));

  return (
    <main className="space-y-6">
      <ListPageHeader
        eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
        title="New job"
        description="Create a branch-aware job, assign the right operator from the live directory, and push a real intake event straight into the operations timeline."
        actions={
          <Link
            href="/jobs"
            className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to jobs
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
          <CreateJobForm
            branches={shell.branches}
            defaultLocationId={defaultLocationId}
            initialAssignees={directoryUsers}
          />
        </article>

        <aside className="space-y-4">
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/72">
              Assignee directory
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              Live workspace membership
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              Search pulls from active workspace members and respects the selected branch context before the server accepts the final assignee.
            </p>
          </section>

          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              Create flow guardrails
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/56">
              <li>Branch must belong to the active workspace</li>
              <li>Reference is generated server-side at submit time</li>
              <li>Job creation writes immediate timeline activity</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
