import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';

export const metadata: Metadata = {
  title: 'Screenshots',
  description:
    'PulseOps screenshot and case-study gallery foundation for portfolio-ready product storytelling.',
};

export default function ScreenshotsPage() {
  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-5xl rounded-[var(--radius-2xl)] border border-white/60 bg-white/82 p-8 shadow-[var(--shadow-card)]">
        <MarketingSectionHeading
          eyebrow="Screenshots"
          title="Case-study-ready product scenes are coming in the next Sprint 10 slice."
          description="The gallery route is live now so screenshot references, portfolio links, and future capture scenes have a stable public destination."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
          >
            Back to landing page
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-fg)] px-5 text-sm font-semibold text-white transition hover:opacity-92"
          >
            See pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
