import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { requireUser } from '@/lib/auth/require-user';
import { requireCurrentMembership } from '@/lib/organizations/require-current-membership';

export default async function SettingsPage() {
  const user = await requireUser();
  const membership = await requireCurrentMembership(user.id);
  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-8 px-6 py-8 lg:px-8">
      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Account settings
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Identity and workspace context stay clearly separated.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
          Sprint 1 keeps the settings surface intentionally small: profile
          identity, login context, and workspace role are visible now so later
          permissions and admin tooling can grow from a reliable baseline.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-[var(--color-fg-muted)]">Full name</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {profile?.full_name ?? 'Not set yet'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Email</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {user.email ?? 'Unknown'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Profile created</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {profile?.created_at
                  ? new Intl.DateTimeFormat('en-GB', {
                      dateStyle: 'medium',
                    }).format(new Date(profile.created_at))
                  : 'Pending'}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-sidebar)] p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Workspace membership
          </h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-[var(--color-fg-muted)]">Workspace</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {membership.organization.name}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Role</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {membership.role}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Slug</dt>
              <dd className="mt-1 font-medium text-[var(--color-fg)]">
                {membership.organization.slug}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
