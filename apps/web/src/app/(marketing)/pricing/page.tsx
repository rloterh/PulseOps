import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth/get-session-user';
import { canManageBilling } from '@/lib/billing/billing-access';
import { getCurrentMembership } from '@/lib/organizations/get-current-membership';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';
import { BillingCheckoutForm } from '@/features/billing/components/billing-action-forms';
import { BillingStatusBanner } from '@/features/billing/components/billing-status-banner';
import { getBillingFlashPresentation } from '@/features/billing/lib/get-billing-flash-presentation';
import { PLAN_CONFIG, type PlanCode } from '@/lib/billing/plans';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Compare PulseOps plans for multi-location service operations and launch Stripe-backed checkout with the same plans used inside the product.',
};

const plans = [
  {
    code: 'free' as const,
    name: 'Free',
    price: 'GBP 0',
    cadence: 'for early teams',
    description:
      'A low-friction entry point for small operators validating the operating model before rolling billing out across a larger organization.',
  },
  {
    code: 'pro' as const,
    name: 'Pro',
    price: 'GBP 79',
    cadence: 'per organization / month',
    description:
      'The production plan for growing service teams that need analytics, saved views, and stronger operating visibility.',
  },
  {
    code: 'business' as const,
    name: 'Business',
    price: 'GBP 199',
    cadence: 'per organization / month',
    description:
      'A higher-control plan for larger multi-branch operations that need premium support and more headroom without friction.',
  },
];

const comparisonRows: {
  label: string;
  getValue: (plan: PlanCode) => string;
}[] = [
  {
    label: 'Operators included',
    getValue: (plan) => String(PLAN_CONFIG[plan].maxOperators),
  },
  {
    label: 'Saved views',
    getValue: (plan) => String(PLAN_CONFIG[plan].maxSavedViews),
  },
  {
    label: 'Advanced filters',
    getValue: (plan) =>
      PLAN_CONFIG[plan].canUseAdvancedFilters ? 'Included' : 'Not included',
  },
  {
    label: 'Analytics access',
    getValue: (plan) =>
      PLAN_CONFIG[plan].canUseAnalytics ? 'Included' : 'Not included',
  },
  {
    label: 'Priority support',
    getValue: (plan) =>
      PLAN_CONFIG[plan].canUsePrioritySupport ? 'Included' : 'Standard',
  },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams =
    ((await (searchParams ?? Promise.resolve({}))) as Record<
      string,
      string | string[] | undefined
    >);
  const [user, params] = await Promise.all([
    getSessionUser(),
    Promise.resolve(resolvedParams),
  ]);
  const membership = user ? await getCurrentMembership(user.id) : null;
  const status =
    typeof params.status === 'string' ? params.status : undefined;
  const canStartCheckout = membership ? canManageBilling(membership.role) : false;
  const flashMessage = getBillingFlashPresentation(status);

  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <MarketingSectionHeading
          eyebrow="Pricing"
          title="Plans that map directly to the product, billing rules, and entitlement checks."
          description="PulseOps charges per organization. The same plans shown here drive Stripe checkout, plan changes, billing portal behavior, and server-side premium feature enforcement inside the app."
        />
        {flashMessage ? (
          <div className="mt-6">
            <BillingStatusBanner {...flashMessage} />
          </div>
        ) : null}
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.code}
            className={`rounded-[var(--radius-2xl)] border p-6 shadow-[var(--shadow-card)] ${
              plan.code === 'business'
                ? 'border-emerald-500/18 bg-[linear-gradient(165deg,rgba(16,32,30,0.98),rgba(27,67,59,0.94))] text-white'
                : 'border-white/60 bg-white/82'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  {plan.name}
                </p>
                <h2
                  className={`mt-3 text-3xl font-semibold tracking-tight ${
                    plan.code === 'business'
                      ? 'text-white'
                      : 'text-[var(--color-fg)]'
                  }`}
                >
                  {plan.price}
                  <span
                    className={`ml-2 text-sm font-medium ${
                      plan.code === 'business'
                        ? 'text-white/50'
                        : 'text-[var(--color-fg-muted)]'
                    }`}
                  >
                    {plan.cadence}
                  </span>
                </h2>
              </div>
              {plan.code === 'business' ? (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Enterprise
                </span>
              ) : null}
            </div>
            <p
              className={`mt-4 text-sm leading-7 ${
                plan.code === 'business'
                  ? 'text-white/68'
                  : 'text-[var(--color-fg-muted)]'
              }`}
            >
              {plan.description}
            </p>
            <ul
              className={`mt-6 space-y-3 text-sm ${
                plan.code === 'business'
                  ? 'text-white/76'
                  : 'text-[var(--color-fg-muted)]'
              }`}
            >
              {[
                `${String(PLAN_CONFIG[plan.code].maxOperators)} operators`,
                `${String(PLAN_CONFIG[plan.code].maxSavedViews)} saved views`,
                PLAN_CONFIG[plan.code].canUseAnalytics
                  ? 'Analytics and export access'
                  : 'Core jobs, incidents, and tasks',
              ].map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="mt-8">
              {plan.code === 'free' ? (
                <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-white/70 px-4 py-3 text-sm text-[var(--color-fg-muted)]">
                  Free remains the fallback when no Stripe subscription is
                  active.
                </div>
              ) : membership && canStartCheckout ? (
                <BillingCheckoutForm
                  plan={plan.code}
                  label={`Start ${plan.name}`}
                  pendingLabel="Preparing checkout..."
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                />
              ) : membership ? (
                <div className="rounded-[var(--radius-xl)] border border-amber-500/24 bg-amber-400/8 px-4 py-3 text-sm text-[var(--color-fg)]">
                  {user && !canStartCheckout
                    ? 'Ask an organization owner or admin to manage billing for this workspace.'
                    : 'Finish workspace setup before starting a paid plan.'}
                </div>
              ) : user ? (
                <Link
                  href="/onboarding"
                  className={`inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                    plan.code === 'business'
                      ? 'border border-white/12 bg-white/5 text-white hover:bg-white/10'
                      : 'border border-[var(--color-border)] bg-white text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                >
                  Set up workspace
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className={`inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                    plan.code === 'business'
                      ? 'border border-white/12 bg-white/5 text-white hover:bg-white/10'
                      : 'border border-[var(--color-border)] bg-white text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                >
                  Sign in to upgrade
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-14 max-w-6xl rounded-[var(--radius-2xl)] border border-white/60 bg-white/82 p-8 shadow-[var(--shadow-card)]">
        <MarketingSectionHeading
          eyebrow="Compare plans"
          title="The public pricing model matches the product gates already in place."
          description="PulseOps does not present marketing-only plans. These entitlements are the same ones used for analytics access, advanced filters, saved views, and support expectations inside the application."
        />

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-fg-muted)]">
                <th className="px-4 py-3 font-medium">Capability</th>
                <th className="px-4 py-3 font-medium">Free</th>
                <th className="px-4 py-3 font-medium">Pro</th>
                <th className="px-4 py-3 font-medium">Business</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-[var(--color-border)]/70">
                  <td className="px-4 py-4 font-medium text-[var(--color-fg)]">
                    {row.label}
                  </td>
                  <td className="px-4 py-4 text-[var(--color-fg-muted)]">
                    {row.getValue('free')}
                  </td>
                  <td className="px-4 py-4 text-[var(--color-fg-muted)]">
                    {row.getValue('pro')}
                  </td>
                  <td className="px-4 py-4 text-[var(--color-fg-muted)]">
                    {row.getValue('business')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl rounded-[2rem] border border-white/60 bg-[linear-gradient(150deg,rgba(12,35,33,0.98),rgba(26,74,64,0.92))] px-8 py-10 text-white shadow-[var(--shadow-floating)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/75">
              Enterprise alignment
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Need a buyer conversation instead of a self-serve checkout?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              PulseOps can still route teams into a human sales path without
              inventing a second pricing model. Business keeps the product and
              billing logic consistent while contact flows handle larger deals.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-white/92"
            >
              Talk to sales
            </Link>
            <Link
              href={'/docs' as Route}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/7 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Explore docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
