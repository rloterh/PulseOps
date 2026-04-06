import Link from 'next/link';
import type { DirectoryUser } from '@/features/directory/types/directory.types';
import { EmptyState } from '@/components/shared/empty-state';
import { ListPageHeader } from '@/components/shared/list-page-header';
import { CreateIncidentForm } from '@/components/incidents/create-incident-form';
import { canCreateIncidents } from '@/features/incidents/lib/incident-permissions';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';
import { getMemberOptions } from '@/lib/organizations/get-member-options';
import { getActiveBranchContext } from '@/lib/tenancy/get-active-branch-context';

export default async function NewIncidentPage() {
  const context = await requireTenantMember();
  const shell = await getActiveBranchContext({ userId: context.viewerId });
  const defaultLocationId = shell.activeBranchId ?? shell.branches[0]?.id ?? null;

  if (!canCreateIncidents(context.membershipRole)) {
    return (
      <main className="space-y-6">
        <ListPageHeader
          eyebrow={context.branchName ? `${context.branchName} branch` : context.tenantName}
          title="New incident"
          description="Incident reporting is limited to active workspace members with response access."
        />
        <EmptyState
          title="You do not have incident reporting access"
          description="Ask an owner, admin, or manager to report this incident, or switch to a role that can open operational incidents."
          actionHref="/incidents"
          actionLabel="Back to incidents"
        />
      </main>
    );
  }

  if (shell.branches.length === 0) {
    return (
      <main className="space-y-6">
        <ListPageHeader
          eyebrow={context.tenantName}
          title="New incident"
          description="PulseOps needs at least one active branch before incident intake can begin."
        />
        <EmptyState
          title="No active branches available"
          description="Create or reactivate a branch first, then return here to report a new incident."
          actionHref="/branches"
          actionLabel="Open branches"
        />
      </main>
    );
  }

  const initialAssignees = defaultLocationId
    ? await getMemberOptions(context.tenantId, defaultLocationId)
    : [];

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
        title="New incident"
        description="Report a branch-aware incident, route it to the right response owner, and log the first operational event immediately."
        actions={
          <Link
            href="/incidents"
            className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to incidents
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.24)]">
          <CreateIncidentForm
            branches={shell.branches}
            defaultLocationId={defaultLocationId}
            initialAssignees={directoryUsers}
          />
        </article>

        <aside className="space-y-4">
          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/72">
              Incident intake
            </p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
              Report from the real branch context
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              The selected branch controls the assignee directory, the reference scope, and the incident context that shows up across the ops shell.
            </p>
          </section>

          <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              Create flow guardrails
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/56">
              <li>Branch must belong to the active workspace</li>
              <li>Incident reference is generated server-side at submit time</li>
              <li>Creation writes immediate incident timeline activity</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
