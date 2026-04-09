import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BillingCheckoutForm,
  BillingPortalForm,
  BillingRenewalForm,
} from '@/features/billing/components/billing-action-forms';
import { BillingStatusBanner } from '@/features/billing/components/billing-status-banner';
import { getBillingFlashPresentation } from '@/features/billing/lib/get-billing-flash-presentation';
import { getBillingStatusPresentation } from '@/features/billing/lib/get-billing-status-presentation';
import { getBillingOverview } from '@/features/billing/queries/get-billing-overview';
import type { PlanCode } from '@/lib/billing/plans';

const PLAN_OPTIONS: {
  code: Exclude<PlanCode, 'free'>;
  name: string;
  price: string;
  description: string;
}[] = [
  {
    code: 'pro',
    name: 'Pro',
    price: 'GBP 79 / month',
    description: 'Best for growing operating teams that need analytics and richer list productivity.',
  },
  {
    code: 'business',
    name: 'Business',
    price: 'GBP 199 / month',
    description: 'Best for multi-branch organizations that need higher limits and priority support.',
  },
] as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams =
    ((await (searchParams ?? Promise.resolve({}))) as Record<
      string,
      string | string[] | undefined
    >);
  const [overview, params] = await Promise.all([
    getBillingOverview(),
    Promise.resolve(resolvedParams),
  ]);
  const status =
    typeof params.status === 'string' ? params.status : undefined;

  if (!overview.canManageBilling) {
    redirect('/dashboard');
  }

  const statusPresentation = getBillingStatusPresentation(overview);
  const flashMessage = getBillingFlashPresentation(status);
  const showRenewalActions =
    overview.plan !== 'free' &&
    overview.subscriptionId &&
    ['active', 'trialing', 'past_due', 'unpaid'].includes(overview.status);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
              Billing
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Workspace billing is now connected to Stripe.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
              PulseOps now manages Stripe checkout, plan changes, portal access,
              entitlement enforcement, and subscription recovery guidance inside the
              protected dashboard shell.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View plans
            </Link>
            <BillingPortalForm
              label="Open billing portal"
              pendingLabel="Opening portal..."
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-6">
          <BillingStatusBanner {...statusPresentation} />
        </div>

        {flashMessage ? (
          <div className="mt-6">
            <BillingStatusBanner {...flashMessage} />
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {[
          {
            label: 'Current plan',
            value: overview.plan.toUpperCase(),
            hint: overview.status === 'free' ? 'No paid subscription yet' : overview.status,
          },
          {
            label: 'Recurring amount',
            value: overview.amountLabel ?? 'Free',
            hint: overview.interval ? `Billed every ${overview.interval}` : 'No recurring charge',
          },
          {
            label: 'Current period end',
            value: overview.currentPeriodEndsAtLabel ?? 'Not started',
            hint: overview.cancelAtPeriodEnd ? 'Cancels at period end' : 'Renews automatically',
          },
          {
            label: 'Trial ends',
            value: overview.trialEndsAtLabel ?? 'No active trial',
            hint: overview.billingConfigured ? 'Stripe-backed lifecycle' : 'Stripe not configured',
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">{card.label}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-3 text-sm leading-6 text-white/55">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Manage plan</h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Upgrade, downgrade, or resume renewal without leaving the workspace.
                Stripe still handles payment details in the customer portal.
              </p>
            </div>
            {overview.plan === 'free' ? (
              <span className="rounded-full border border-amber-400/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                Free plan
              </span>
            ) : (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                {overview.plan} active
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {PLAN_OPTIONS.map((plan) => {
              const isCurrentPlan = overview.plan === plan.code && !overview.cancelAtPeriodEnd;
              const actionLabel =
                overview.plan === 'free'
                  ? `Start ${plan.name}`
                  : overview.plan === plan.code
                    ? `${plan.name} active`
                    : overview.plan === 'business' && plan.code === 'pro'
                      ? 'Downgrade to Pro'
                      : `Upgrade to ${plan.name}`;

              return (
                <article
                  key={plan.code}
                  className="rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        {plan.name}
                      </p>
                      <p className="mt-3 text-xl font-semibold text-white">{plan.price}</p>
                    </div>
                    {isCurrentPlan ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/58">{plan.description}</p>
                  <div className="mt-6">
                    <BillingCheckoutForm
                      plan={plan.code}
                      label={actionLabel}
                      pendingLabel="Preparing checkout..."
                      disabled={!overview.billingConfigured || isCurrentPlan}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45"
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {showRenewalActions ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {overview.cancelAtPeriodEnd ? (
                <BillingRenewalForm
                  intent="resume"
                  label="Resume renewal"
                  pendingLabel="Resuming renewal..."
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                />
              ) : (
                <BillingRenewalForm
                  intent="cancel"
                  label="Cancel at period end"
                  pendingLabel="Scheduling cancellation..."
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-300/30 bg-red-300/10 px-5 text-sm font-semibold text-red-100 transition hover:bg-red-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              )}
              <BillingPortalForm
                label="Update payment method"
                pendingLabel="Opening portal..."
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          ) : null}
        </article>

        <article className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Commercial state</h2>
          <dl className="mt-5 space-y-4 text-sm text-white/65">
            <div className="flex items-start justify-between gap-4">
              <dt>Status</dt>
              <dd className="font-medium capitalize text-white">{overview.status}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt>Stripe customer</dt>
              <dd className="max-w-[13rem] truncate font-medium text-white">
                {overview.stripeCustomerId ?? 'Not linked yet'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt>Subscription</dt>
              <dd className="max-w-[13rem] truncate font-medium text-white">
                {overview.subscriptionId ?? 'No active subscription'}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-4 text-sm leading-6 text-white/58">
            {overview.status === 'past_due' || overview.status === 'unpaid'
              ? 'The subscription is behind on payment. Use the billing portal to update the payment method or settle the invoice before premium features are interrupted.'
              : overview.status === 'trialing'
                ? 'The workspace is still in trial. Checkout, portal access, and entitlement sync are already live, so the app can react once the trial converts.'
                : overview.billingConfigured
                  ? 'Checkout, subscription sync, upgrade and downgrade actions, cancel or resume controls, and the Stripe portal are all wired through server-side helpers.'
                  : 'Set the Stripe env vars locally before testing checkout, portal, or webhook sync.'}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Entitlements</h2>
          <p className="mt-2 text-sm leading-6 text-white/56">
            These limits now come from server-side plan mapping and already gate parts
            of the app such as saved views and analytics access.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Operators</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {overview.entitlements.maxOperators}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Saved views</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {overview.entitlements.maxSavedViews}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                Advanced filters
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {overview.entitlements.canUseAdvancedFilters ? 'Enabled' : 'Locked'}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Analytics</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {overview.entitlements.canUseAnalytics ? 'Enabled' : 'Locked'}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Recovery path</h2>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Billing friction is handled inside the workspace, but Stripe still owns
            payment details and invoices.
          </p>
          <div className="mt-6 space-y-3 text-sm leading-6 text-white/60">
            <p>
              Use the portal for payment method updates, invoice history, and the
              canonical Stripe customer view.
            </p>
            <p>
              If checkout was incomplete or a payment is overdue, the billing page will
              keep surfacing recovery guidance until the synced subscription state
              improves.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <BillingPortalForm
              label="Open Stripe portal"
              pendingLabel="Opening portal..."
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <Link
              href="/pricing"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Compare plans
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
