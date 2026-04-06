import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireCurrentMembership } from '@/lib/organizations/require-current-membership';

export default async function BranchesPage() {
  const membership = await requireCurrentMembership();
  const supabase = await createSupabaseServerClient();
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, name, code, timezone, created_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-8 px-6 py-8 lg:px-8">
      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Branch baseline
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          The first workspace locations are live.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
          PulseOps will eventually model full branch operations in this module.
          For Sprint 1, the locations table provides a concrete tenancy-aware data
          slice and validates that org-scoped reads are working end to end.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {locations.map((location) => (
          <article
            key={location.id}
            className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {location.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                  Code {location.code}
                </p>
              </div>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-fg-muted)]">
                {location.timezone}
              </span>
            </div>
            <p className="mt-5 text-sm leading-6 text-[var(--color-fg-muted)]">
              Created{' '}
              {new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
              }).format(new Date(location.created_at))}
              .
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
