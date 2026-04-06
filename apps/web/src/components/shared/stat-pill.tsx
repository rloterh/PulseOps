import { cn } from '@pulseops/utils';

export function StatPill({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em]',
        tone === 'default' && 'border-white/10 bg-white/[0.05] text-white/72',
        tone === 'success' && 'border-emerald-300/22 bg-emerald-300/14 text-emerald-200',
        tone === 'warning' && 'border-amber-300/20 bg-amber-300/10 text-amber-100',
        tone === 'danger' && 'border-rose-300/20 bg-rose-300/10 text-rose-100',
      )}
    >
      {label}
    </span>
  );
}
