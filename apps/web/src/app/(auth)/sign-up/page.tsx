import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getClientEnvResult } from '@pulseops/env/client';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { getSessionUser } from '@/lib/auth/get-session-user';

export default async function SignUpPage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  }

  const supabaseConfigured = getClientEnvResult().success;

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Sprint 1 onboarding
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your account and launch the first PulseOps workspace.
          </h1>
          <p className="max-w-xl text-base leading-8 text-[var(--color-fg-muted)]">
            Account creation now flows into tenant bootstrap, so the app can move
            from foundation scaffolding into the first real operations context.
          </p>
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-sidebar)] p-6">
          <p className="text-sm font-medium text-[var(--color-fg)]">
            What this sprint unlocks
          </p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--color-fg-muted)]">
            <li>Authenticated sessions with Supabase and callback handling</li>
            <li>Automatic profile bootstrap tied to auth users</li>
            <li>First workspace creation with owner membership assignment</li>
          </ul>
        </div>
      </section>

      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/90 p-8 shadow-[var(--shadow-floating)]">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-fg-muted)]">
            Create account
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Start with a secure operator login
          </h2>
        </div>

        {!supabaseConfigured ? (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
            Add valid Supabase environment variables to <code>.env.local</code>{' '}
            before using authentication in local development.
          </div>
        ) : null}

        <div className="mt-6">
          <SignUpForm />
        </div>

        <p className="mt-6 text-sm text-[var(--color-fg-muted)]">
          Already registered?{' '}
          <Link href="/sign-in" className="font-medium text-[var(--color-primary)]">
            Sign in here
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
