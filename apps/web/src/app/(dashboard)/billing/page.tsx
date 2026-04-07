import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createBillingPortalSessionAction } from '@/features/billing/actions/create-billing-portal-session-action';
import { createCheckoutSessionAction } from '@/features/billing/actions/create-checkout-session-action';
import { updateSubscriptionRenewalAction } from '@/features/billing/actions/update-subscription-renewal-action';
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
  const flashMessage = getBillingFlashMessage(status);
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
            <form action={createBillingPortalSessionAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                Open billing portal
              </button>
            </form>
          </div>
        </div>

        <StatusBanner
          tone={statusPresentation.tone}
          title={statusPresentation.title}
          description={statusPresentation.description}
        />

        {flashMessage ? (
          <StatusBanner
            tone={flashMessage.tone}
            title={flashMessage.title}
            description={flashMessage.description}
          />
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
                  <form action={createCheckoutSessionAction} className="mt-6">
                    <input type="hidden" name="plan" value={plan.code} />
                    <button
                      type="submit"
                      disabled={!overview.billingConfigured || isCurrentPlan}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45"
                    >
                      {actionLabel}
                    </button>
                  </form>
                </article>
              );
            })}
          </div>

          {showRenewalActions ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {overview.cancelAtPeriodEnd ? (
                <form action={updateSubscriptionRenewalAction}>
                  <input type="hidden" name="intent" value="resume" />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                  >
                    Resume renewal
                  </button>
                </form>
              ) : (
                <form action={updateSubscriptionRenewalAction}>
                  <input type="hidden" name="intent" value="cancel" />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-300/30 bg-red-300/10 px-5 text-sm font-semibold text-red-100 transition hover:bg-red-300/15"
                  >
                    Cancel at period end
                  </button>
                </form>
              )}
              <form action={createBillingPortalSessionAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Update payment method
                </button>
              </form>
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
            <form action={createBillingPortalSessionAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                Open Stripe portal
              </button>
            </form>
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

function StatusBanner({
  tone,
  title,
  description,
}: {
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  title: string;
  description: string;
}) {
  const styles = {
    neutral: 'mt-6 border border-white/10 bg-white/5 text-white/80',
    success: 'mt-6 border border-emerald-400/20 bg-emerald-300/10 text-emerald-100',
    warning: 'mt-6 border border-amber-400/25 bg-amber-300/10 text-amber-100',
    danger: 'mt-6 border border-red-400/25 bg-red-300/10 text-red-100',
  } as const;

  return (
    <div className={`rounded-[1.25rem] px-4 py-3 ${styles[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{description}</p>
    </div>
  );
}

function getBillingFlashMessage(status?: string):
  | {
      tone: 'neutral' | 'success' | 'warning' | 'danger';
      title: string;
      description: string;
    }
  | null {
  switch (status) {
    case 'checkout-success':
      return {
        tone: 'success',
        title: 'Checkout completed',
        description:
          'Stripe checkout finished successfully. The workspace subscription will stay in sync through the webhook path.',
      };
    case 'plan-updated':
      return {
        tone: 'success',
        title: 'Plan updated',
        description:
          'The workspace plan was updated successfully and the latest subscription state has been synced.',
      };
    case 'cancel-scheduled':
      return {
        tone: 'warning',
        title: 'Cancellation scheduled',
        description:
          'The subscription will stop renewing at the end of the current billing period unless you resume it before then.',
      };
    case 'cancel-resumed':
      return {
        tone: 'success',
        title: 'Renewal resumed',
        description:
          'Automatic renewal is active again and the workspace will stay on the paid plan unless you change it later.',
      };
    case 'no-change':
      return {
        tone: 'neutral',
        title: 'No billing change needed',
        description:
          'The selected plan already matches the active subscription, so nothing needed to change.',
      };
    case 'no-subscription':
      return {
        tone: 'warning',
        title: 'No active subscription found',
        description:
          'This workspace does not currently have a synced paid subscription to update or cancel.',
      };
    case 'billing-unavailable':
      return {
        tone: 'warning',
        title: 'Billing is not configured',
        description:
          'Stripe environment variables are missing in this environment, so checkout and portal actions are unavailable.',
      };
    case 'rate-limited':
      return {
        tone: 'warning',
        title: 'Billing action paused',
        description:
          'Too many billing actions were requested in a short window. Wait a moment, then try again from the billing page.',
      };
    case 'no-customer':
      return {
        tone: 'warning',
        title: 'No Stripe customer linked yet',
        description:
          'Start checkout once to create and link the Stripe customer, then the billing portal will be available for that workspace.',
      };
    case 'forbidden':
      return {
        tone: 'danger',
        title: 'Billing access denied',
        description:
          'Only organization owners and admins can manage subscriptions, plan changes, or the Stripe portal.',
      };
    case 'invalid-action':
      return {
        tone: 'warning',
        title: 'Billing action could not be completed',
        description:
          'The requested billing transition was not valid for the current subscription state.',
      };
    default:
      return null;
  }
}
