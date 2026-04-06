import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { getDashboardSummary } from '@/features/dashboard/queries/get-dashboard-summary';
import { requireAppAccess } from '@/lib/auth/require-app-access';
import { getActiveBranchContext } from '@/lib/tenancy/get-active-branch-context';

export default async function DashboardPage() {
  const { user } = await requireAppAccess();
  const shell = await getActiveBranchContext({ userId: user.id });
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
      />
      <DashboardGrid summary={summary} />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/72">
            Sprint 2 shell
          </p>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
            The dashboard is now a real app surface.
          </h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/54">
            <li>Protected shell with responsive sidebar, topbar, and mobile drawer</li>
            <li>Branch switcher, notifications shell, and command palette interactions</li>
            <li>Typed widget contracts that can accept real domain data in Sprint 3</li>
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
