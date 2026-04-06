import { StatCard } from '@/features/dashboard/components/stat-card';
import { getDashboardStats } from '@/lib/organizations/get-dashboard-stats';
import { requireCurrentMembership } from '@/lib/organizations/require-current-membership';

export default async function DashboardPage() {
  const membership = await requireCurrentMembership();
  const stats = await getDashboardStats(membership.organization_id);

  return (
    <main className="space-y-8 px-6 py-8 lg:px-8">
      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Workspace overview
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {membership.organization.name} is ready for the next PulseOps modules.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
          Sprint 1 establishes the first real authenticated shell, tenant
          membership context, and onboarding path. Later operations domains can
          now plug into a live workspace boundary instead of static placeholders.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Branches"
          value={stats.locationsCount}
          hint="Starter location records currently stand in for the branch model until the deeper operations schema lands."
        />
        <StatCard
          label="Operators"
          value={stats.membersCount}
          hint="Organization membership is now enforced at the database layer with RLS-aware access rules."
        />
        <StatCard
          label="Open jobs"
          value={stats.openJobsCount}
          hint="Jobs are intentionally deferred, but the protected shell is ready for the first live workload surfaces."
        />
        <StatCard
          label="Workspace role"
          value={membership.role}
          hint="Role-aware rendering can now grow safely on top of the initial owner and admin policy model."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/90 p-7 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold tracking-tight">
            What Sprint 1 delivers
          </h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-[var(--color-fg-muted)]">
            <li>Secure Supabase sign-up, sign-in, callback, and sign-out flows</li>
            <li>Profile bootstrapping through the auth users trigger path</li>
            <li>Organization and membership records with RLS as the tenancy root</li>
            <li>Protected route handling that funnels first-time users into onboarding</li>
          </ul>
        </article>

        <article className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-sidebar)] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            Current workspace
          </p>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-[var(--color-fg-muted)]">Slug</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {membership.organization.slug}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Created</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {new Intl.DateTimeFormat('en-GB', {
                  dateStyle: 'medium',
                }).format(new Date(membership.organization.created_at))}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
