import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getBillingOverview } from '@/features/billing/queries/get-billing-overview';
import { createBillingPortalSessionAction } from '@/features/billing/actions/create-billing-portal-session-action';

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
              PulseOps now tracks a workspace-level customer, mirrors subscription state
              into Postgres, and prepares server-side entitlements for later feature
              enforcement.
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
        {status ? (
          <div className="mt-6 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            {status === 'checkout-success'
              ? 'Stripe checkout finished. Subscription sync will complete through the webhook path.'
              : status === 'billing-unavailable'
                ? 'Stripe is not configured in this environment yet.'
                : status === 'no-customer'
                  ? 'No Stripe customer is linked to this workspace yet.'
                  : status === 'forbidden'
                    ? 'Only owners and admins can manage billing.'
                    : 'Billing returned a status update.'}
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
          <h2 className="text-lg font-semibold text-white">Entitlements</h2>
          <p className="mt-2 text-sm leading-6 text-white/56">
            These limits now come from server-side plan mapping and will back future
            enforcement in the app.
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
            {overview.billingConfigured
              ? 'Checkout, subscription sync, and portal launching are now wired through server-side Stripe helpers.'
              : 'Set the Stripe env vars locally before testing checkout, portal, or webhook sync.'}
          </div>
        </article>
      </section>
    </main>
  );
}
