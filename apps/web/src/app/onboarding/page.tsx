import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-session-user';
import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form';
import { getCurrentMembership } from '@/lib/organizations/get-current-membership';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/sign-in?next=/onboarding');
  }

  const membership = await getCurrentMembership(user.id);

  if (membership) {
    redirect('/dashboard');
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Workspace onboarding
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Create the first PulseOps workspace for your team.
          </h1>
          <p className="max-w-xl text-base leading-8 text-[var(--color-fg-muted)]">
            This is the first tenancy bootstrap step. Once the workspace exists,
            the protected shell can load with a real membership context and the
            rest of the product can build on top of that boundary.
          </p>
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-sidebar)] p-6">
          <p className="text-sm font-medium text-[var(--color-fg)]">
            What happens next
          </p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--color-fg-muted)]">
            <li>Your workspace record is created with a clean public slug</li>
            <li>Your account becomes the owner of that workspace</li>
            <li>A starter Head Office location is added for the first dashboard slice</li>
          </ul>
        </div>
      </section>

      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/90 p-8 shadow-[var(--shadow-floating)]">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-fg-muted)]">
            Final setup step
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Name your first workspace
          </h2>
        </div>

        <div className="mt-6">
          <CreateOrganizationForm />
        </div>
      </section>
    </main>
  );
}
