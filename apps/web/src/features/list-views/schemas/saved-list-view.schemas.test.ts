import { describe, expect, it } from 'vitest';
import {
  createSavedListViewSchema,
  parseSavedListViewFilters,
} from './saved-list-view.schemas';

describe('savedListViewSchemas', () => {
  it('accepts a valid jobs view payload', () => {
    const parsed = createSavedListViewSchema.safeParse({
      resourceType: 'jobs',
      name: 'Morning triage',
      filtersPayload: JSON.stringify({
        q: 'pump',
        status: 'scheduled',
        sort: 'title',
        direction: 'desc',
      }),
    });

    expect(parsed.success).toBe(true);
  });

  it('parses a valid incident filter payload', () => {
    expect(
      parseSavedListViewFilters(
        'incidents',
        JSON.stringify({
          severity: 'critical',
          status: 'investigating',
          sort: 'opened_at',
          direction: 'desc',
        }),
      ),
    ).toMatchObject({
      severity: 'critical',
      status: 'investigating',
    });
  });

  it('rejects invalid payloads', () => {
    expect(
      parseSavedListViewFilters(
        'jobs',
        JSON.stringify({
          priority: 'impossible',
        }),
      ),
    ).toBeNull();
  });
});
