'use client';

export function ErrorState({
  title = 'Something went wrong.',
  description = 'The request could not be completed. Please try again.',
  actionLabel = 'Try again',
  onAction,
  actionHref,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[color:color-mix(in_oklch,var(--color-danger)_24%,white)] bg-[color:color-mix(in_oklch,var(--color-danger)_10%,white)] px-6 py-10 text-center shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-danger)]">
        Error state
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--color-fg)]">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-fg)] px-5 py-2.5 text-sm font-medium text-[var(--color-surface)] transition hover:opacity-90"
          >
            {actionLabel}
          </button>
        ) : null}
        {actionHref ? (
          <a
            href={actionHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
          >
            Open another route
          </a>
        ) : null}
      </div>
    </section>
  );
}
