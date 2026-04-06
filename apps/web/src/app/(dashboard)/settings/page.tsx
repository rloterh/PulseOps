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
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/72">
          Account settings
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Identity and workspace context stay clearly separated.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
          Sprint 2 keeps the settings route aligned with the new shell while the
          deeper admin and notification controls wait for later sprints.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_20px_65px_rgba(2,6,23,0.25)]">
          <h2 className="text-lg font-semibold tracking-tight text-white">Profile</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-white/42">Full name</dt>
              <dd className="mt-1 font-medium text-white">
                {profile?.full_name ?? 'Not set yet'}
              </dd>
            </div>
            <div>
              <dt className="text-white/42">Email</dt>
              <dd className="mt-1 font-medium text-white">
                {user.email ?? 'Unknown'}
              </dd>
            </div>
            <div>
              <dt className="text-white/42">Profile created</dt>
              <dd className="mt-1 font-medium text-white">
                {profile?.created_at
                  ? new Intl.DateTimeFormat('en-GB', {
                      dateStyle: 'medium',
                    }).format(new Date(profile.created_at))
                  : 'Pending'}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_20px_65px_rgba(2,6,23,0.25)]">
          <h2 className="text-lg font-semibold tracking-tight">
            Workspace membership
          </h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-white/42">Workspace</dt>
              <dd className="mt-1 font-medium text-white">
                {membership.organization.name}
              </dd>
            </div>
            <div>
              <dt className="text-white/42">Role</dt>
              <dd className="mt-1 font-medium text-white capitalize">
                {membership.role}
              </dd>
            </div>
            <div>
              <dt className="text-white/42">Slug</dt>
              <dd className="mt-1 font-medium text-white">
                {membership.organization.slug}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
