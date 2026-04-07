import { describe, expect, it } from 'vitest';
import { createIncidentEscalationSchema } from './incident-mutation.schemas';

describe('createIncidentEscalationSchema', () => {
  it('accepts a direct-user escalation target', () => {
    const result = createIncidentEscalationSchema.safeParse({
      incidentId: '4fa70701-1a3f-4521-a6b1-f1a9112d7280',
      escalationLevel: '2',
      reason: 'Paging the branch lead now',
      targetUserId: '4fa70701-1a3f-4521-a6b1-f1a9112d7281',
      targetRole: '',
      targetQueue: '',
    });

    expect(result.success).toBe(true);
  });

  it('requires at least one escalation target', () => {
    const result = createIncidentEscalationSchema.safeParse({
      incidentId: '4fa70701-1a3f-4521-a6b1-f1a9112d7280',
      escalationLevel: '2',
      reason: '',
      targetUserId: '',
      targetRole: '',
      targetQueue: '   ',
    });

    expect(result.success).toBe(false);
  });
});
