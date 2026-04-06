import { describe, expect, it } from 'vitest';
import { createBulkActionFeedback } from './bulk-action-feedback';

describe('createBulkActionFeedback', () => {
  it('returns an error when nothing changes', () => {
    expect(
      createBulkActionFeedback({
        resourceLabel: 'job',
        selectedCount: 3,
        updatedCount: 0,
        statusLabel: 'Completed',
      }),
    ).toEqual({
      error: 'No jobs changed status. They may already match the selected state.',
    });
  });

  it('returns a partial success message when some records are skipped', () => {
    expect(
      createBulkActionFeedback({
        resourceLabel: 'incident',
        selectedCount: 4,
        updatedCount: 2,
        statusLabel: 'Resolved',
      }),
    ).toEqual({
      success:
        'Updated 2 of 4 incidents to Resolved. 2 already matched the selected state.',
    });
  });

  it('returns a full success message when every record changes', () => {
    expect(
      createBulkActionFeedback({
        resourceLabel: 'job',
        selectedCount: 1,
        updatedCount: 1,
        statusLabel: 'Scheduled',
      }),
    ).toEqual({
      success: 'Updated 1 job to Scheduled.',
    });
  });
});
