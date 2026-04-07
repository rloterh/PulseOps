import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'PulseOps blog foundation for operational best practices, release notes, and case-study-style product stories.',
};

export default function BlogIndexPage() {
  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-5xl rounded-[var(--radius-2xl)] border border-white/60 bg-white/82 p-8 shadow-[var(--shadow-card)]">
        <MarketingSectionHeading
          eyebrow="Blog"
          title="Thought leadership and release storytelling are arriving next in Sprint 10."
          description="The route boundary is live now so the marketing shell, navigation, and metadata contracts stay stable while the content system lands in the next subsection."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
          >
            Explore docs
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-fg)] px-5 text-sm font-semibold text-white transition hover:opacity-92"
          >
            Review pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
