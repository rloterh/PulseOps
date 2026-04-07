import { describe, expect, it } from 'vitest';
import { canViewAnalytics } from '@/features/analytics/lib/analytics.permissions';

describe('canViewAnalytics', () => {
  it('allows privileged roles', () => {
    expect(canViewAnalytics('owner')).toBe(true);
    expect(canViewAnalytics('admin')).toBe(true);
    expect(canViewAnalytics('manager')).toBe(true);
  });

  it('blocks agents from analytics views', () => {
    expect(canViewAnalytics('agent')).toBe(false);
  });
});
