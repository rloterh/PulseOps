import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';

export const metadata: Metadata = {
  title: 'Operations Command Center',
  description:
    'PulseOps gives multi-location service businesses one calm control layer for branches, jobs, incidents, audits, SLAs, analytics, billing, and AI guidance.',
};

const proofMetrics = [
  { label: 'Locations compared', value: '24+' },
  { label: 'Critical workflows', value: '7' },
  { label: 'Operator-ready views', value: '1' },
];

const valuePillars = [
  {
    title: 'Multi-branch control',
    description:
      'See branch pressure, backlog, incident volume, and SLA drift without stitching together disconnected tools.',
  },
  {
    title: 'AI-guided operations',
    description:
      'Turn analytics into actionable summaries, late-job risk signals, and branch-specific next steps instead of dashboards without guidance.',
  },
  {
    title: 'Serious governance',
    description:
      'Track audit activity, escalation workflows, collaboration history, and billing controls in one tenant-aware system.',
  },
];

const workflowCards = [
  {
    title: 'Dispatch with context',
    description:
      'Jobs, incidents, tasks, saved views, inbox triage, and SLA risk all stay connected to the same branch and organization model.',
  },
  {
    title: 'Escalate without noise',
    description:
      'Incident escalation, watcher notifications, audit history, and admin review make urgent issues visible without turning the whole product into alert spam.',
  },
  {
    title: 'Report like leadership',
    description:
      'Analytics, branch comparisons, SLA review, exports, and explainable AI summaries create a presentation-ready layer for operators and buyers.',
  },
];

const showcasePanels = [
  {
    eyebrow: 'Branch operations',
    title: 'Backlog, incidents, and SLA pressure surfaced by branch',
    description:
      'PulseOps keeps the branch switcher, comparisons, AI summaries, and exportable reporting aligned so teams can act on the same operational truth.',
  },
  {
    eyebrow: 'Incident escalation',
    title: 'Escalation, audit, and admin review in the same operating system',
    description:
      'Critical incidents carry escalation state, activity history, notifications, and admin traceability without leaving the product flow.',
  },
  {
    eyebrow: 'Commercial controls',
    title: 'Billing, pricing, and entitlement gating wired into the product',
    description:
      'The public pricing surface maps directly to the Stripe-backed plans and entitlement rules already implemented inside the application.',
  },
];

const faqs = [
  {
    question: 'Who is PulseOps built for?',
    answer:
      'Multi-location service businesses that need one system for branches, jobs, incidents, tasks, audits, SLAs, billing, analytics, and operational visibility.',
  },
  {
    question: 'Is PulseOps only a dashboard?',
    answer:
      'No. It includes operational workflows, escalation handling, collaboration, notifications, analytics, and Stripe-backed billing rather than only passive reporting.',
  },
  {
    question: 'Does the AI layer replace operator judgment?',
    answer:
      'No. The AI layer is deliberately inspectable. It highlights risks, explains the signals behind them, and links operators back into the real record views.',
  },
];

export default function MarketingHomePage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-emerald-500/15 bg-white/88 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-primary)] shadow-[var(--shadow-card)]">
              Sprint 10 CMS and marketing
            </p>
            <div className="space-y-6">
              <h1 className="max-w-5xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                The operations command center for multi-location service teams.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-fg-muted)]">
                PulseOps unifies branches, jobs, incidents, audits, SLAs,
                billing, analytics, and explainable AI guidance in one product
                that feels credible to operators and buyers.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-fg)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition hover:opacity-92"
              >
                Start your workspace
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-6 text-sm font-semibold text-[var(--color-fg)] transition hover:bg-white"
              >
                Explore pricing
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {proofMetrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-[var(--radius-xl)] border border-white/55 bg-white/78 p-5 shadow-[var(--shadow-card)]"
                >
                  <p className="text-3xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
                    {metric.label}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(228,241,237,0.92))] p-6 shadow-[var(--shadow-floating)]">
            <div className="rounded-[1.65rem] border border-emerald-900/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(16,32,30,0.92))] p-5 text-white shadow-[0_24px_55px_rgba(15,23,42,0.3)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                    Executive snapshot
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">
                    3 branches need attention today
                  </h2>
                </div>
                <div className="rounded-full border border-amber-300/18 bg-amber-300/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                  SLA risk
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ['Backlog', '27 jobs', 'Up 11% from last window'],
                  ['Incidents', '4 active', '2 escalated'],
                  ['AI summary', 'High risk', 'Late jobs concentrated in North'],
                ].map(([title, value, caption]) => (
                  <div
                    key={title}
                    className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                      {title}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                    <p className="mt-3 text-xs leading-6 text-white/62">
                      {caption}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-emerald-400/15 bg-emerald-300/8 px-4 py-3 text-sm leading-7 text-emerald-50/88">
                Recommended next step: rebalance dispatch capacity for the North
                branch and acknowledge two critical incidents before noon.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {valuePillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[var(--radius-2xl)] border border-white/55 bg-white/78 p-7 shadow-[var(--shadow-card)]"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {pillar.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-fg-muted)]">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <MarketingSectionHeading
          eyebrow="How it works"
          title="Built to keep operations, oversight, and executive visibility in one lane."
          description="PulseOps is designed as a disciplined operating system rather than another dashboard layer. The same branch-aware data model powers workflows, reporting, billing, and AI assistance."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {workflowCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[var(--radius-2xl)] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,246,244,0.9))] p-7 shadow-[var(--shadow-card)]"
            >
              <h3 className="text-xl font-semibold tracking-tight">
                {card.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-fg-muted)]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {showcasePanels.map((panel) => (
            <article
              key={panel.title}
              className="rounded-[var(--radius-2xl)] border border-slate-900/5 bg-[linear-gradient(165deg,rgba(20,30,28,0.97),rgba(25,52,48,0.94))] p-7 text-white shadow-[var(--shadow-floating)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/75">
                {panel.eyebrow}
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                {panel.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/68">
                {panel.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <MarketingSectionHeading
              eyebrow="Why buyers care"
              title="One product surface that explains itself."
              description="The public site, billing model, docs, analytics, and AI layer now tell the same story. That makes PulseOps easier to trust, buy, and operate."
              actions={
                <>
                  <Link
                    href="/docs"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-5 text-sm font-semibold text-[var(--color-fg)] transition hover:bg-white"
                  >
                    Explore docs
                  </Link>
                  <Link
                    href={'/screenshots' as Route}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-transparent bg-[color-mix(in_oklab,var(--color-primary)_16%,white)] px-5 text-sm font-semibold text-[var(--color-fg)] transition hover:bg-[color-mix(in_oklab,var(--color-primary)_22%,white)]"
                  >
                    View screenshots
                  </Link>
                </>
              }
            />
          </div>

          <div className="space-y-4 rounded-[var(--radius-2xl)] border border-white/60 bg-white/78 p-7 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
              Operator proof
            </p>
            <blockquote className="text-xl font-semibold leading-9 tracking-tight">
              “PulseOps gives leadership one calm place to see backlog pressure,
              incident escalation, billing state, and AI-guided next steps
              without sending operators into five tools.”
            </blockquote>
            <p className="text-sm text-[var(--color-fg-muted)]">
              Example buyer-ready positioning for the marketing layer and case
              study system introduced in Sprint 10.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <MarketingSectionHeading
          eyebrow="FAQ"
          title="Answers for buyers, operators, and reviewers."
          description="Sprint 10 is focused on a public layer that explains the product clearly without overselling it."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {faqs.map((item) => (
            <article
              key={item.question}
              className="rounded-[var(--radius-xl)] border border-white/60 bg-white/76 p-6 shadow-[var(--shadow-card)]"
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {item.question}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-fg-muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6">
        <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(150deg,rgba(12,35,33,0.98),rgba(26,74,64,0.92))] px-8 py-10 text-white shadow-[var(--shadow-floating)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/78">
                Ready to explore
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Start with pricing, docs, or a live workspace.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Sprint 10 brings the public product layer up to the quality of
                the authenticated app so the story holds together end to end.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-white/92"
              >
                Compare plans
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/7 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Create workspace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
