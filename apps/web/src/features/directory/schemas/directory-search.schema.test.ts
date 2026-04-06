import { describe, expect, it } from 'vitest';
import {
  directorySearchRouteSchema,
  directorySearchSchema,
} from './directory-search.schema';

describe('directorySearchSchema', () => {
  it('normalizes optional directory inputs', () => {
    expect(
      directorySearchSchema.parse({
        organizationId: '11111111-1111-4111-8111-111111111111',
        locationId: '',
        query: '  ops  ',
        limit: '18',
      }),
    ).toEqual({
      organizationId: '11111111-1111-4111-8111-111111111111',
      locationId: null,
      query: 'ops',
      limit: 18,
    });
  });
});

describe('directorySearchRouteSchema', () => {
  it('falls back to safe route defaults', () => {
    expect(directorySearchRouteSchema.parse({})).toEqual({
      locationId: null,
      q: '',
      limit: 12,
    });
  });

  it('rejects oversized route limits', () => {
    expect(() =>
      directorySearchRouteSchema.parse({
        q: 'dispatch',
        limit: 80,
      }),
    ).toThrow();
  });
});
