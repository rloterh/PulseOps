import type { Route } from 'next';
import Link from 'next/link';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: Route;
  actionLabel?: string;
}) {
  return (
    <section className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center shadow-[0_20px_70px_rgba(2,6,23,0.2)]">
      <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/56 sm:text-base">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
