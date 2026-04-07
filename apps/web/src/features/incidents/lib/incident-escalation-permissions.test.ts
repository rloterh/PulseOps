import { describe, expect, it } from 'vitest';
import {
  canAcknowledgeIncidentEscalation,
  canManageIncidentEscalations,
} from './incident-escalation-permissions';

describe('incident escalation permissions', () => {
  it('allows privileged roles to manage escalations', () => {
    expect(canManageIncidentEscalations('owner')).toBe(true);
    expect(canManageIncidentEscalations('admin')).toBe(true);
    expect(canManageIncidentEscalations('manager')).toBe(true);
  });

  it('blocks agents from managing escalations directly', () => {
    expect(canManageIncidentEscalations('agent')).toBe(false);
  });

  it('allows the direct escalation target to acknowledge', () => {
    expect(
      canAcknowledgeIncidentEscalation({
        role: 'agent',
        viewerId: 'viewer-1',
        targetUserId: 'viewer-1',
      }),
    ).toBe(true);
  });

  it('blocks non-target non-privileged viewers from acknowledging', () => {
    expect(
      canAcknowledgeIncidentEscalation({
        role: 'agent',
        viewerId: 'viewer-1',
        targetUserId: 'viewer-2',
      }),
    ).toBe(false);
  });
});
