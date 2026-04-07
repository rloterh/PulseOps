import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'PulseOps help center foundation for onboarding, troubleshooting, and operational how-to content.',
};

export default function HelpIndexPage() {
  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-5xl rounded-[var(--radius-2xl)] border border-white/60 bg-white/82 p-8 shadow-[var(--shadow-card)]">
        <MarketingSectionHeading
          eyebrow="Help center"
          title="Support articles are being added on top of the new public content foundation."
          description="This route is live now so the public IA is stable while the next subsection adds structured help content, article pages, and docs relationships."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
          >
            Contact team
          </Link>
          <Link
            href="/docs"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-fg)] px-5 text-sm font-semibold text-white transition hover:opacity-92"
          >
            Open docs
          </Link>
        </div>
      </section>
    </main>
  );
}
