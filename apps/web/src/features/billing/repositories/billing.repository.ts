import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@pulseops/supabase/types';
import { getEntitlementsForPlan } from '@/lib/billing/plans';
import { getPlanCodeFromStripePriceId } from '@/lib/billing/stripe-prices';

type BillingCustomerRow = Database['public']['Tables']['billing_customers']['Row'];
type BillingSubscriptionRow =
  Database['public']['Tables']['billing_subscriptions']['Row'];
type OrganizationEntitlementsRow =
  Database['public']['Tables']['organization_entitlements']['Row'];

export async function getBillingCustomerFromDb(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<BillingCustomerRow | null> {
  const { data, error } = await supabase
    .from('billing_customers')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getBillingCustomerByStripeIdFromDb(
  supabase: SupabaseClient<Database>,
  stripeCustomerId: string,
) {
  const { data, error } = await supabase
    .from('billing_customers')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertBillingCustomerInDb(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    stripeCustomerId: string;
  },
) {
  const { error } = await supabase.from('billing_customers').upsert(
    {
      organization_id: input.organizationId,
      stripe_customer_id: input.stripeCustomerId,
    },
    {
      onConflict: 'organization_id',
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getBillingSubscriptionFromDb(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<BillingSubscriptionRow | null> {
  const { data, error } = await supabase
    .from('billing_subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getOrganizationEntitlementsFromDb(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<OrganizationEntitlementsRow | null> {
  const { data, error } = await supabase
    .from('organization_entitlements')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertOrganizationEntitlementsInDb(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    plan: Database['public']['Enums']['plan_code'];
  },
) {
  const entitlements = getEntitlementsForPlan(input.plan);
  const { error } = await supabase.from('organization_entitlements').upsert(
    {
      organization_id: input.organizationId,
      plan: entitlements.plan,
      max_operators: entitlements.maxOperators,
      max_saved_views: entitlements.maxSavedViews,
      can_use_advanced_filters: entitlements.canUseAdvancedFilters,
      can_use_analytics: entitlements.canUseAnalytics,
      can_use_priority_support: entitlements.canUsePrioritySupport,
    },
    {
      onConflict: 'organization_id',
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function findBillingEventByStripeEventIdFromDb(
  supabase: SupabaseClient<Database>,
  stripeEventId: string,
) {
  const { data, error } = await supabase
    .from('billing_events')
    .select('id, processed_at')
    .eq('stripe_event_id', stripeEventId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertBillingEventInDb(
  supabase: SupabaseClient<Database>,
  input: {
    stripeEventId: string;
    eventType: string;
    livemode: boolean;
    payload: Json;
  },
) {
  const { error } = await supabase.from('billing_events').insert({
    stripe_event_id: input.stripeEventId,
    event_type: input.eventType,
    livemode: input.livemode,
    payload: input.payload,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function markBillingEventProcessedInDb(
  supabase: SupabaseClient<Database>,
  stripeEventId: string,
) {
  const { error } = await supabase
    .from('billing_events')
    .update({
      processed_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', stripeEventId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertBillingSubscriptionFromStripeInDb(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    stripeCustomerId: string;
    subscription: Stripe.Subscription;
  },
) {
  const item = input.subscription.items.data[0];
  const priceId = item ? item.price.id : null;
  const productId = item
    ? typeof item.price.product === 'string'
      ? item.price.product
      : item.price.product.id
    : null;
  const interval = item?.price.recurring?.interval ?? null;
  const amountUnit = item ? item.price.unit_amount : null;
  const currency = item ? item.price.currency : null;
  const plan = getPlanCodeFromStripePriceId(priceId);

  const { error } = await supabase.from('billing_subscriptions').upsert(
    {
      organization_id: input.organizationId,
      stripe_customer_id: input.stripeCustomerId,
      stripe_subscription_id: input.subscription.id,
      stripe_price_id: priceId,
      stripe_product_id: productId,
      plan,
      status:
        input.subscription.status === 'canceled'
          ? 'canceled'
          : (input.subscription.status as Database['public']['Enums']['subscription_status']),
      interval,
      currency,
      amount_unit: amountUnit,
      cancel_at_period_end: input.subscription.cancel_at_period_end,
      current_period_start: toIsoString(item?.current_period_start ?? null),
      current_period_end: toIsoString(item?.current_period_end ?? null),
      trial_start: toIsoString(input.subscription.trial_start),
      trial_end: toIsoString(input.subscription.trial_end),
      canceled_at: toIsoString(input.subscription.canceled_at),
      ended_at: toIsoString(input.subscription.ended_at),
      raw: input.subscription as unknown as Json,
    },
    {
      onConflict: 'organization_id',
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

function toIsoString(value: number | null) {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null;
}
