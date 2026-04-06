import { describe, expect, it } from 'vitest';
import { parseBulkJobIds } from './bulk-job-action.schemas';

describe('bulkJobActionSchemas', () => {
  it('deduplicates valid job ids', () => {
    const id = '11111111-1111-4111-8111-111111111111';

    expect(parseBulkJobIds(JSON.stringify([id, id]))).toEqual([id]);
  });

  it('returns null for invalid payloads', () => {
    expect(parseBulkJobIds(JSON.stringify(['not-a-uuid']))).toBeNull();
  });
});
