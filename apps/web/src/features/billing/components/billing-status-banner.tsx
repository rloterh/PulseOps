import type { BillingStatusPresentation } from '@/features/billing/lib/get-billing-status-presentation';

export function BillingStatusBanner({
  tone,
  title,
  description,
}: BillingStatusPresentation) {
  const styles = {
    neutral: 'border border-white/10 bg-white/5 text-white/80',
    success: 'border border-emerald-400/20 bg-emerald-300/10 text-emerald-100',
    warning: 'border border-amber-400/25 bg-amber-300/10 text-amber-100',
    danger: 'border border-red-400/25 bg-red-300/10 text-red-100',
  } as const;

  return (
    <div className={`rounded-[1.25rem] px-4 py-3 ${styles[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{description}</p>
    </div>
  );
}
