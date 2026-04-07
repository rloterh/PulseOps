import { describe, expect, it } from 'vitest';
import { buildAnalyticsExportHref } from '@/features/analytics/lib/build-analytics-export-href';

describe('buildAnalyticsExportHref', () => {
  it('builds a stable export href for branch comparison filters', () => {
    const href = buildAnalyticsExportHref({
      dataset: 'branches',
      filters: {
        preset: '30d',
        from: '2026-04-01',
        to: '2026-04-30',
        branchId: 'branch-1',
        compare: false,
      },
    });

    expect(href).toBe(
      '/api/analytics/export?dataset=branches&preset=30d&from=2026-04-01&to=2026-04-30&branchId=branch-1&compare=false',
    );
  });

  it('omits optional params that are not present', () => {
    const href = buildAnalyticsExportHref({
      dataset: 'sla',
      filters: {
        preset: '7d',
        from: null,
        to: null,
        branchId: null,
        compare: true,
      },
    });

    expect(href).toBe('/api/analytics/export?dataset=sla&preset=7d');
  });
});
