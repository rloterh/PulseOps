import Link from 'next/link';
import { getClientEnvResult } from '@pulseops/env/client';

export default function VerifyPage() {
  const supabaseConfigured = getClientEnvResult().success;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
      <section className="w-full rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white/90 p-8 shadow-[var(--shadow-floating)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Verify access
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Confirm your email, then continue to onboarding.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
          PulseOps uses a secure callback flow for new account confirmation.
          After you verify your email, you will land back in the app and continue
          into workspace setup automatically.
        </p>

        {!supabaseConfigured ? (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
            Supabase environment variables are still missing locally, so callback
            verification cannot complete until they are configured.
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] shadow-[var(--shadow-card)] transition hover:opacity-95"
          >
            Return to sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
          >
            Create another account
          </Link>
        </div>
      </section>
    </main>
  );
}
