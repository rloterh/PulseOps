import { describe, expect, it } from 'vitest';
import { buildAdminActivityQuery } from '@/features/audit/lib/build-admin-activity-query';

describe('buildAdminActivityQuery', () => {
  it('serializes only active filters and later pages', () => {
    expect(
      buildAdminActivityQuery(
        {
          q: 'incident',
          scope: 'incident',
          actorUserId: 'user-1',
          entityType: 'all',
          locationId: 'branch-1',
        },
        3,
      ),
    ).toBe('q=incident&scope=incident&actorUserId=user-1&locationId=branch-1&page=3');
  });

  it('omits default filters and first-page pagination', () => {
    expect(
      buildAdminActivityQuery(
        {
          q: '',
          scope: 'all',
          actorUserId: 'all',
          entityType: 'all',
          locationId: 'all',
        },
        1,
      ),
    ).toBe('');
  });
});
