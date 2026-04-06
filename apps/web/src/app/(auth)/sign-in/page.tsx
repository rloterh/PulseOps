import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getClientEnvResult } from '@pulseops/env/client';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { getSessionUser } from '@/lib/auth/get-session-user';

export default async function SignInPage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  }

  const supabaseConfigured = getClientEnvResult().success;

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1.1fr)_460px] lg:items-center">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            PulseOps access
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to your workspace command center.
          </h1>
          <p className="max-w-xl text-base leading-8 text-[var(--color-fg-muted)]">
            Sprint 1 brings the first real authentication slice online, with
            workspace-aware routing and onboarding built into the app shell.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [
              'Protected routing',
              'Dashboard surfaces now redirect through a real auth boundary instead of static placeholders.',
            ],
            [
              'Workspace onboarding',
              'New accounts can bootstrap their first PulseOps workspace after authentication.',
            ],
          ].map(([title, description]) => (
            <article
              key={title}
              className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-5 shadow-[var(--shadow-card)]"
            >
              <h2 className="text-base font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-fg-muted)]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/90 p-8 shadow-[var(--shadow-floating)]">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-fg-muted)]">
            Welcome back
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Continue into PulseOps
          </h2>
        </div>

        {!supabaseConfigured ? (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
            Add valid Supabase environment variables to <code>.env.local</code>{' '}
            before using authentication in local development.
          </div>
        ) : null}

        <div className="mt-6">
          <SignInForm />
        </div>

        <p className="mt-6 text-sm text-[var(--color-fg-muted)]">
          Need an account?{' '}
          <Link href="/sign-up" className="font-medium text-[var(--color-primary)]">
            Create one here
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
