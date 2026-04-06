import { describe, expect, it } from 'vitest';
import { parseBulkIncidentIds } from './bulk-incident-action.schemas';

describe('bulkIncidentActionSchemas', () => {
  it('deduplicates valid incident ids', () => {
    const id = '22222222-2222-4222-8222-222222222222';

    expect(parseBulkIncidentIds(JSON.stringify([id, id]))).toEqual([id]);
  });

  it('returns null for invalid payloads', () => {
    expect(parseBulkIncidentIds(JSON.stringify(['not-a-uuid']))).toBeNull();
  });
});
