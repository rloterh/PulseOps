import type { ReactNode } from 'react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(250,252,251,1),rgba(242,247,246,1))] text-[var(--color-fg)]">
      <div className="absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(22,163,74,0.12),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.75),_transparent)]" />
      <MarketingHeader />
      <div>{children}</div>
      <MarketingFooter />
    </div>
  );
}
