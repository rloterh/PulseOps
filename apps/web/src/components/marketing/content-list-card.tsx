import type { Route } from 'next';
import Link from 'next/link';

export function ContentListCard({
  eyebrow,
  title,
  description,
  href,
  meta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: Route;
  meta?: string;
}) {
  return (
    <article className="rounded-[var(--radius-2xl)] border border-white/60 bg-white/82 p-6 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-fg-muted)]">
        {description}
      </p>
      <div className="mt-5 flex items-center justify-between gap-4">
        {meta ? (
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
            {meta}
          </span>
        ) : (
          <span />
        )}
        <Link
          href={href}
          className="inline-flex text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-80"
        >
          Read more
        </Link>
      </div>
    </article>
  );
}
