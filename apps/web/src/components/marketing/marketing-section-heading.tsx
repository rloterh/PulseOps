import type { ReactNode } from 'react';

export function MarketingSectionHeading({
  eyebrow,
  title,
  description,
  actions,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  align?: 'left' | 'center';
}) {
  const alignmentClass = align === 'center' ? 'mx-auto text-center' : '';

  return (
    <div className={`max-w-3xl space-y-4 ${alignmentClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
        {description}
      </p>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
