import type { Database } from '@pulseops/supabase/types';
import type { OrganizationEntitlements, PlanCode } from '@/lib/billing/plans';

export type SubscriptionStatus =
  Database['public']['Enums']['subscription_status'];

export interface BillingOverview {
  organizationId: string;
  organizationName: string;
  billingConfigured: boolean;
  canManageBilling: boolean;
  plan: PlanCode;
  status: SubscriptionStatus | 'free';
  interval: string | null;
  amountLabel: string | null;
  trialEndsAtLabel: string | null;
  currentPeriodEndsAtLabel: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  entitlements: OrganizationEntitlements;
}
