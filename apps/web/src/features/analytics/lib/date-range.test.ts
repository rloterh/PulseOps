import { describe, expect, it } from 'vitest';
import { resolveAnalyticsDateRange } from '@/features/analytics/lib/date-range';

describe('resolveAnalyticsDateRange', () => {
  it('resolves preset windows with a matching comparison period', () => {
    const range = resolveAnalyticsDateRange(
      {
        preset: '7d',
        from: null,
        to: null,
        branchId: null,
        compare: true,
      },
      new Date('2026-04-07T12:00:00.000Z'),
    );

    expect(range.from.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    expect(range.to.toISOString()).toBe('2026-04-07T23:59:59.999Z');
    expect(range.compareFrom?.toISOString()).toBe('2026-03-25T00:00:00.000Z');
    expect(range.compareTo?.toISOString()).toBe('2026-03-31T23:59:59.999Z');
  });

  it('uses custom windows when valid custom dates are provided', () => {
    const range = resolveAnalyticsDateRange(
      {
        preset: 'custom',
        from: '2026-02-01',
        to: '2026-02-10',
        branchId: null,
        compare: false,
      },
      new Date('2026-04-07T12:00:00.000Z'),
    );

    expect(range.from.toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(range.to.toISOString()).toBe('2026-02-10T23:59:59.999Z');
    expect(range.compareFrom).toBeNull();
    expect(range.compareTo).toBeNull();
  });
});
