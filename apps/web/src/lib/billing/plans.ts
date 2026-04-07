export type PlanCode = 'free' | 'pro' | 'business';

export interface OrganizationEntitlements {
  plan: PlanCode;
  maxOperators: number;
  maxSavedViews: number;
  canUseAdvancedFilters: boolean;
  canUseAnalytics: boolean;
  canUsePrioritySupport: boolean;
}

export const PLAN_CONFIG: Record<PlanCode, OrganizationEntitlements> = {
  free: {
    plan: 'free',
    maxOperators: 3,
    maxSavedViews: 3,
    canUseAdvancedFilters: false,
    canUseAnalytics: false,
    canUsePrioritySupport: false,
  },
  pro: {
    plan: 'pro',
    maxOperators: 15,
    maxSavedViews: 25,
    canUseAdvancedFilters: true,
    canUseAnalytics: true,
    canUsePrioritySupport: false,
  },
  business: {
    plan: 'business',
    maxOperators: 100,
    maxSavedViews: 200,
    canUseAdvancedFilters: true,
    canUseAnalytics: true,
    canUsePrioritySupport: true,
  },
};

export function getEntitlementsForPlan(plan: PlanCode): OrganizationEntitlements {
  return PLAN_CONFIG[plan];
}

export function isPaidPlan(plan: PlanCode) {
  return plan !== 'free';
}
