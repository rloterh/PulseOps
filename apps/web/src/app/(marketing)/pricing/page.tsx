import Link from 'next/link';
import { getSessionUser } from '@/lib/auth/get-session-user';
import { getCurrentMembership } from '@/lib/organizations/get-current-membership';
import { createCheckoutSessionAction } from '@/features/billing/actions/create-checkout-session-action';

const plans = [
  {
    code: 'free',
    name: 'Free',
    price: '£0',
    description: 'Small teams validating the operating model before rolling billing out.',
    features: ['Up to 3 operators', '3 saved views', 'Core jobs, incidents, and tasks'],
  },
  {
    code: 'pro',
    name: 'Pro',
    price: '£79',
    description: 'The default production plan for growing service operations teams.',
    features: ['15 operators', '25 saved views', 'Advanced filters and analytics access'],
  },
  {
    code: 'business',
    name: 'Business',
    price: '£199',
    description: 'Enterprise-grade controls for larger multi-branch operations teams.',
    features: ['100 operators', '200 saved views', 'Priority support and premium controls'],
  },
] as const;

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
  const [user, params] = await Promise.all([getSessionUser(), Promise.resolve(resolvedParams)]);
  const membership = user ? await getCurrentMembership(user.id) : null;
  const status =
    typeof params.status === 'string' ? params.status : undefined;

  return (
    <main className="px-6 py-12 lg:px-10">
      <section className="mx-auto max-w-6xl rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Pricing
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Stripe-backed billing is now ready to replace the old placeholder surface.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
          PulseOps charges at the workspace level. Owners and admins can launch secure
          checkout, manage subscriptions through Stripe, and later benefit from
          entitlement-gated features without client-only enforcement.
        </p>
        {status ? (
          <div className="mt-6 rounded-[var(--radius-xl)] border border-amber-400/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {status === 'billing-unavailable'
              ? 'Stripe is not configured in this environment yet.'
              : status === 'checkout-canceled'
                ? 'Checkout was canceled before a subscription was created.'
                : status === 'checkout-error'
                  ? 'Stripe could not create a checkout session.'
                  : status === 'invalid-plan'
                    ? 'The selected plan was not valid.'
                    : 'Billing returned a status update.'}
          </div>
        ) : null}
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.code}
            className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  {plan.name}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {plan.price}
                  <span className="ml-2 text-sm font-medium text-white/50">/ month</span>
                </h2>
              </div>
              {plan.code === 'business' ? (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Enterprise
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-7 text-white/60">{plan.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-white/72">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="mt-8">
              {plan.code === 'free' ? (
                <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                  Free remains the fallback when no Stripe subscription is active.
                </div>
              ) : user && membership ? (
                <form action={createCheckoutSessionAction}>
                  <input type="hidden" name="plan" value={plan.code} />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                  >
                    Start {plan.name}
                  </button>
                </form>
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in to upgrade
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
