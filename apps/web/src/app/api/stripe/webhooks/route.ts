import { getServerEnv } from '@pulseops/env/server';
import type { Json } from '@pulseops/supabase/types';
import { createSupabaseAdminClient } from '@pulseops/supabase/admin';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { syncBillingFromStripeSubscription, resolveOrganizationIdForStripeCustomer } from '@/lib/billing/sync-billing-state';
import {
  findBillingEventByStripeEventIdFromDb,
  insertBillingEventInDb,
  markBillingEventProcessedInDb,
} from '@/features/billing/repositories/billing.repository';

export async function POST(request: Request) {
  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe webhook handling is not configured.' },
      { status: 503 },
    );
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const existingEvent = await findBillingEventByStripeEventIdFromDb(supabase, event.id);

  if (existingEvent?.processed_at) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (!existingEvent) {
    const parsedPayload: Json = JSON.parse(payload) as Json;

    await insertBillingEventInDb(supabase, {
      stripeEventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
      payload: parsedPayload,
    });
  }

  await handleStripeEvent(event, stripe);
  await markBillingEventProcessedInDb(supabase, event.id);

  return NextResponse.json({ received: true });
}

async function handleStripeEvent(event: Stripe.Event, stripe: Stripe) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const organizationId = session.metadata?.organization_id ?? session.client_reference_id;
      const stripeCustomerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id ?? null;

      if (!organizationId || !stripeCustomerId || !subscriptionId) {
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncBillingFromStripeSubscription({
        organizationId,
        stripeCustomerId,
        subscription,
      });
      return;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const stripeCustomerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;
      const organizationId =
        subscription.metadata.organization_id ??
        (await resolveOrganizationIdForStripeCustomer(stripeCustomerId));

      if (!organizationId) {
        return;
      }

      await syncBillingFromStripeSubscription({
        organizationId,
        stripeCustomerId,
        subscription,
      });
      return;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as {
        subscription?: string | Stripe.Subscription | null;
        customer?: string | Stripe.Customer | Stripe.DeletedCustomer | null;
      };
      const subscriptionId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id ?? null;
      const stripeCustomerId =
        typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null;

      if (!subscriptionId || !stripeCustomerId) {
        return;
      }

      const organizationId = await resolveOrganizationIdForStripeCustomer(stripeCustomerId);

      if (!organizationId) {
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncBillingFromStripeSubscription({
        organizationId,
        stripeCustomerId,
        subscription,
      });
      return;
    }
    default:
      return;
  }
}
