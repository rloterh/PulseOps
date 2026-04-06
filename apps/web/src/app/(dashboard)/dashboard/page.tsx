import Link from 'next/link';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { getDashboardSummary } from '@/features/dashboard/queries/get-dashboard-summary';
import { canCreateJobs } from '@/features/jobs/lib/jobs-permissions';
import { requireAppAccess } from '@/lib/auth/require-app-access';
import { getActiveBranchContext } from '@/lib/tenancy/get-active-branch-context';

export default async function DashboardPage() {
  const { user } = await requireAppAccess();
  const shell = await getActiveBranchContext({ userId: user.id });
  const canCreate = canCreateJobs(shell.viewer.role);
  const summary = await getDashboardSummary({
    tenantId: shell.tenantId,
    _branchId: shell.activeBranchId,
    branchName: shell.activeBranchName,
  });

  return (
    <main className="space-y-6">
      <DashboardHeader
        tenantName={shell.tenantName}
        branchName={shell.activeBranchName}
        actions={
          canCreate && shell.branches.length > 0 ? (
            <Link
              href="/jobs/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
            >
              Create job
            </Link>
          ) : null
        }
      />
      <DashboardGrid summary={summary} />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/72">
            Sprint 4A1 progress
          </p>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
            The operations shell now supports real intake flow.
          </h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/54">
            <li>Protected shell with responsive sidebar, topbar, branch context, and mobile drawer</li>
            <li>Real incidents and jobs modules already feed the operational dashboard surface</li>
            <li>New job intake now runs through location-aware directory and server-side creation guards</li>
          </ul>
        </article>

        <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/38">
            Current context
          </p>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-white/42">Active branch</dt>
              <dd className="mt-1 font-medium text-white">
                {shell.activeBranchName ?? 'No active branch selected'}
              </dd>
            </div>
            <div>
              <dt className="text-white/42">Viewer</dt>
              <dd className="mt-1 font-medium text-white">
                {shell.viewer.fullName ?? shell.viewer.email}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
