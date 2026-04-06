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
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/72">
          Branch operations
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Branch context is now part of the app shell.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
          Sprint 2 uses the existing locations model as the branch switcher source
          of truth. The deeper branch domain can now evolve without replacing the
          shell or route structure.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {locations.map((location) => (
          <article
            key={location.id}
            className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_20px_65px_rgba(2,6,23,0.25)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  {location.name}
                </h2>
                <p className="mt-2 text-sm text-white/48">
                  Code {location.code}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/54">
                {location.timezone ?? 'No timezone'}
              </span>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/54">
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
