import { describe, expect, it } from 'vitest';
import { evaluateWorkItemSla } from './evaluate-work-item-sla';
import type { WorkItemSlaSnapshot } from '@/features/sla/types/sla.types';

const baseSnapshot: WorkItemSlaSnapshot = {
  id: 'snapshot-1',
  organization_id: 'org-1',
  location_id: 'loc-1',
  entity_type: 'incident',
  entity_id: 'incident-1',
  policy_id: 'policy-1',
  status_category: 'active',
  first_response_target_minutes: 15,
  resolution_target_minutes: 60,
  first_response_due_at: '2026-04-07T10:00:00.000Z',
  resolution_due_at: '2026-04-07T11:00:00.000Z',
  first_responded_at: null,
  resolved_at: null,
  paused_at: null,
  paused_reason: null,
  total_paused_seconds: 0,
  escalation_state: 'none',
  risk_level: 'normal',
  warning_sent_at: null,
  first_response_breached_at: null,
  resolution_breached_at: null,
  escalation_triggered_at: null,
  last_evaluated_at: null,
  created_at: '2026-04-07T09:00:00.000Z',
  updated_at: '2026-04-07T09:00:00.000Z',
};

describe('evaluateWorkItemSla', () => {
  it('marks warning when the warn window is reached', () => {
    const result = evaluateWorkItemSla(baseSnapshot, {
      policy: {
        warn_before_breach_minutes: 10,
        escalate_on_first_response_breach: true,
        escalate_on_resolution_breach: true,
      },
      now: new Date('2026-04-07T09:55:00.000Z'),
    });

    expect(result.riskLevel).toBe('at_risk');
    expect(result.escalationState).toBe('none');
    expect(result.warningSentAt).toBe('2026-04-07T09:55:00.000Z');
  });

  it('marks breach and pending escalation when first response is overdue', () => {
    const result = evaluateWorkItemSla(baseSnapshot, {
      policy: {
        warn_before_breach_minutes: 10,
        escalate_on_first_response_breach: true,
        escalate_on_resolution_breach: false,
      },
      now: new Date('2026-04-07T10:30:00.000Z'),
    });

    expect(result.riskLevel).toBe('breached');
    expect(result.escalationState).toBe('warning');
    expect(result.firstResponseBreachedAt).toBe('2026-04-07T10:30:00.000Z');
  });

  it('marks escalated when an open escalation already exists', () => {
    const result = evaluateWorkItemSla(baseSnapshot, {
      policy: {
        warn_before_breach_minutes: 10,
        escalate_on_first_response_breach: true,
        escalate_on_resolution_breach: true,
      },
      openEscalationTriggeredAt: '2026-04-07T09:40:00.000Z',
      now: new Date('2026-04-07T09:45:00.000Z'),
    });

    expect(result.riskLevel).toBe('at_risk');
    expect(result.escalationState).toBe('escalated');
    expect(result.escalationTriggeredAt).toBe('2026-04-07T09:40:00.000Z');
  });
});
