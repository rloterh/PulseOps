export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-fg-muted)]">
        {hint}
      </p>
    </article>
  );
}
