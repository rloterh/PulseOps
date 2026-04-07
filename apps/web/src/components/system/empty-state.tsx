export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center shadow-[var(--shadow-card)]">
      <h1 className="text-xl font-semibold tracking-tight text-[var(--color-fg)]">{title}</h1>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
          {description}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <a
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-fg)] transition hover:opacity-95"
        >
          {actionLabel}
        </a>
      ) : null}
    </section>
  );
}
