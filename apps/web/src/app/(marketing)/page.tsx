import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@pulseops/ui';
import { getSessionUser } from '@/lib/auth/get-session-user';

export const dynamic = 'force-dynamic';

export default async function MarketingHomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <AppShell>
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,118,110,0.10),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(242,247,246,1))]" />
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col justify-center gap-10 px-6 py-20">
          <div className="max-w-4xl space-y-6">
            <p className="inline-flex rounded-full border border-[var(--color-border)] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)] shadow-[var(--shadow-card)]">
              Sprint 1 Auth And Tenancy
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Operations software for service teams that need clarity, not
              chaos.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--color-fg-muted)]">
              PulseOps is being built as a premium multi-tenant command center
              for jobs, branches, incidents, billing, analytics, and customer
              visibility. Sprint 1 turns that foundation into a live product
              slice with authentication, workspace onboarding, and a protected
              dashboard shell.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] shadow-[var(--shadow-card)] transition hover:opacity-95"
            >
              Create your workspace
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
            >
              Sign in to PulseOps
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ['Secure auth foundation', 'Supabase-backed sign-in, sign-up, callback, and sign-out flows now anchor the first production-minded slice.'],
              ['Workspace onboarding', 'New operators can create their first PulseOps workspace and owner membership without leaving the app.'],
              ['Protected app shell', 'Dashboard routing is now tenant-aware, with real org-scoped reads replacing a purely static shell.'],
            ].map(([title, description]) => (
              <article
                key={title}
                className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-card)]"
              >
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-fg-muted)]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
