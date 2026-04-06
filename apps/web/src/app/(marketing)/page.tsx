import Link from 'next/link';
import { AppShell } from '@pulseops/ui';

export default function MarketingHomePage() {
  return (
    <AppShell>
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,118,110,0.10),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(242,247,246,1))]" />
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col justify-center gap-10 px-6 py-20">
          <div className="max-w-4xl space-y-6">
            <p className="inline-flex rounded-full border border-[var(--color-border)] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)] shadow-[var(--shadow-card)]">
              Sprint 0 Foundation
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Operations software for service teams that need clarity, not
              chaos.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--color-fg-muted)]">
              PulseOps is being built as a premium multi-tenant command center
              for jobs, branches, incidents, billing, analytics, and customer
              visibility. Sprint 0 establishes the architecture, tooling, and
              design system that every later module will stand on.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] shadow-[var(--shadow-card)] transition hover:opacity-95"
            >
              Review the foundation docs
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
            >
              See placeholder commercial surfaces
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ['Domain-first architecture', 'Workspace packages, typed envs, and server-safe boundaries are in place before feature logic lands.'],
              ['Enterprise UX baseline', 'Tokens, surfaces, spacing, and route shells are ready for the premium PulseOps visual language.'],
              ['Operational guardrails', 'CI, Docker, docs, tests, and security headers are part of the repo from the first sprint.'],
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
