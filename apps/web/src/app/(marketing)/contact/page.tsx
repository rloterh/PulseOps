import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to PulseOps about multi-location operations, rollout strategy, billing, or product walkthroughs.',
};

const contactOptions = [
  {
    title: 'Sales and rollout',
    description:
      'For buyers comparing tools, rollout discussions, or pricing questions across multiple branches.',
    href: 'mailto:hello@pulseops.example?subject=PulseOps%20sales%20conversation',
    label: 'hello@pulseops.example',
  },
  {
    title: 'Support and implementation',
    description:
      'For current operators needing help with billing, onboarding, analytics, or configuration.',
    href: 'mailto:support@pulseops.example?subject=PulseOps%20support',
    label: 'support@pulseops.example',
  },
];

export default function ContactPage() {
  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <MarketingSectionHeading
          eyebrow="Contact"
          title="Talk to the team about rollout, pricing, or operating fit."
          description="Sprint 10 replaces the old placeholder route with a real conversion surface so buyers, evaluators, and operators have a clear next step."
        />
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6 rounded-[var(--radius-2xl)] border border-white/60 bg-white/82 p-7 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Contact routes
          </p>
          {contactOptions.map((option) => (
            <article
              key={option.title}
              className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <h2 className="text-lg font-semibold tracking-tight">
                {option.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-fg-muted)]">
                {option.description}
              </p>
              <a
                href={option.href}
                className="mt-4 inline-flex text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-80"
              >
                {option.label}
              </a>
            </article>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(150deg,rgba(12,35,33,0.98),rgba(26,74,64,0.92))] p-8 text-white shadow-[var(--shadow-floating)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/75">
            Best-fit conversations
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Buyers usually want clarity on branch count, rollout pace, and reporting expectations.
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-white/72">
            <li>How many branches or service locations will use PulseOps?</li>
            <li>Which team owns jobs, incidents, audits, and SLA review today?</li>
            <li>Do you need premium analytics access immediately or after rollout?</li>
            <li>Should billing stay self-serve or route through a human approval step?</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/92"
            >
              Review pricing
            </Link>
            <Link
              href="/docs"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/16 bg-white/7 px-5 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Explore docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
