import { createPerformanceMarkName } from '@/lib/performance/metrics';

describe('createPerformanceMarkName', () => {
  it('normalizes PulseOps performance mark names', () => {
    expect(createPerformanceMarkName('Analytics', 'Branch Table')).toBe(
      'pulseops:analytics:branch table',
    );
  });
});
