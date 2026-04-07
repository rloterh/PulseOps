import Link from 'next/link';
import { getOrganizationEntitlements } from '@/lib/billing/get-organization-entitlements';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

export default async function AnalyticsPage() {
  const context = await requireTenantMember();
  const entitlements = await getOrganizationEntitlements(context.tenantId);

  if (!entitlements.canUseAnalytics) {
    return (
      <main className="space-y-6">
        <section className="rounded-[2rem] border border-amber-400/20 bg-amber-300/10 px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">
            Analytics
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Analytics is locked on the current billing plan.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
            Sprint 6 now enforces billing entitlements for premium analytics access on the
            server. Upgrade the workspace plan to unlock deeper operational reporting.
          </p>
          <div className="mt-6">
            <Link
              href="/billing"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
            >
              Open billing
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
          Analytics
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Analytics access is enabled on this plan.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
          The route is still intentionally light, but Sprint 6 now ties analytics access to
          organization entitlements instead of leaving it as a universally-open placeholder.
        </p>
      </section>
    </main>
  );
}
