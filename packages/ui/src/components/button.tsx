import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@pulseops/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-[var(--shadow-card)] hover:opacity-95',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)]',
  ghost: 'bg-transparent text-[var(--color-fg)] hover:bg-black/5',
};

export function Button({
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
