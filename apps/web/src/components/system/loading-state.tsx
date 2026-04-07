export function LoadingState({
  title = 'Loading PulseOps',
  description = 'Please wait while the latest data settles.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--color-fg)]">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
        {description}
      </p>
    </section>
  );
}
