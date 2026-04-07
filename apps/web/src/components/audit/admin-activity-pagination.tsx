import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

export function AdminActivityPagination({
  hasPrevious,
  hasNext,
  previousHref,
  nextHref,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  previousHref: string;
  nextHref: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <PaginationLink
        href={previousHref}
        disabled={!hasPrevious}
      >
        Previous
      </PaginationLink>
      <PaginationLink
        href={nextHref}
        disabled={!hasNext}
      >
        Next
      </PaginationLink>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  const className =
    'inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition';

  if (disabled) {
    return (
      <span className={`${className} border-white/10 bg-white/[0.03] text-white/35`}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href as Route}
      className={`${className} border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]`}
    >
      {children}
    </Link>
  );
}
