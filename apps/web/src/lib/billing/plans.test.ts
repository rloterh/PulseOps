import { describe, expect, it } from 'vitest';
import { getEntitlementsForPlan } from './plans';

describe('getEntitlementsForPlan', () => {
  it('returns free limits', () => {
    expect(getEntitlementsForPlan('free')).toMatchObject({
      maxOperators: 3,
      maxSavedViews: 3,
      canUseAdvancedFilters: false,
    });
  });

  it('returns business limits', () => {
    expect(getEntitlementsForPlan('business')).toMatchObject({
      maxOperators: 100,
      maxSavedViews: 200,
      canUsePrioritySupport: true,
    });
  });
});
