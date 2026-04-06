import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          The route you requested does not exist.
        </h1>
        <p className="text-sm leading-6 text-[var(--color-fg-muted)]">
          PulseOps is scaffolded for Sprint 0, so most routes are intentionally
          placeholders while the foundation is being locked in.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] shadow-[var(--shadow-card)] transition hover:opacity-95"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
