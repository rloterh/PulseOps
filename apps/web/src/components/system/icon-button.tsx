'use client';

export function IconButton({
  label,
  children,
  className,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
}) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      title={props.title ?? label}
      className={
        className ??
        'inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50'
      }
    >
      {children}
    </button>
  );
}
