import { describe, expect, it } from 'vitest';
import { isProtectedRoute, isPublicRoute } from '@/lib/auth/route-access';

describe('route access', () => {
  it('treats Sprint 10 marketing routes as public', () => {
    expect(isPublicRoute('/blog')).toBe(true);
    expect(isPublicRoute('/blog/multi-location-ops-without-spreadsheet-drift')).toBe(
      true,
    );
    expect(isPublicRoute('/help/how-to-review-late-job-risk-signals')).toBe(true);
    expect(isPublicRoute('/docs/analytics/overview-and-branches')).toBe(true);
    expect(isPublicRoute('/compare/pulseops-vs-generic-ticketing-tools')).toBe(
      true,
    );
    expect(isPublicRoute('/screenshots')).toBe(true);
  });

  it('keeps dashboard surfaces protected', () => {
    expect(isProtectedRoute('/dashboard')).toBe(true);
    expect(isProtectedRoute('/analytics')).toBe(true);
    expect(isProtectedRoute('/jobs/123')).toBe(true);
    expect(isProtectedRoute('/blog')).toBe(false);
  });
});
