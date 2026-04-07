import type { SlaPolicyRecord, WorkItemSlaSnapshot } from '@/features/sla/types/sla.types';

function toTimestamp(value: string | null) {
  return value ? new Date(value).getTime() : null;
}

export function evaluateWorkItemSla(
  snapshot: WorkItemSlaSnapshot,
  input?: {
    policy?: Pick<
      SlaPolicyRecord,
      'warn_before_breach_minutes' | 'escalate_on_first_response_breach' | 'escalate_on_resolution_breach'
    > | null;
    openEscalationTriggeredAt?: string | null;
    now?: Date;
  },
) {
  const now = input?.now ?? new Date();
  const nowTimestamp = now.getTime();
  const policy = input?.policy ?? null;
  const firstResponseDueAt = toTimestamp(snapshot.first_response_due_at);
  const resolutionDueAt = toTimestamp(snapshot.resolution_due_at);
  const openEscalationTriggeredAt = toTimestamp(input?.openEscalationTriggeredAt ?? null);
  const firstResponseBreached =
    snapshot.status_category === 'active' &&
    !snapshot.first_responded_at &&
    firstResponseDueAt !== null &&
    firstResponseDueAt <= nowTimestamp;
  const resolutionBreached =
    snapshot.status_category === 'active' &&
    !snapshot.resolved_at &&
    resolutionDueAt !== null &&
    resolutionDueAt <= nowTimestamp;

  const warnWindowMs = (policy?.warn_before_breach_minutes ?? 0) * 60 * 1000;
  const firstResponseWarning =
    snapshot.status_category === 'active' &&
    !snapshot.first_responded_at &&
    !firstResponseBreached &&
    firstResponseDueAt !== null &&
    warnWindowMs > 0 &&
    firstResponseDueAt - warnWindowMs <= nowTimestamp;
  const resolutionWarning =
    snapshot.status_category === 'active' &&
    !snapshot.resolved_at &&
    !resolutionBreached &&
    resolutionDueAt !== null &&
    warnWindowMs > 0 &&
    resolutionDueAt - warnWindowMs <= nowTimestamp;

  const shouldAutoEscalate =
    (firstResponseBreached && (policy?.escalate_on_first_response_breach ?? false)) ||
    (resolutionBreached && (policy?.escalate_on_resolution_breach ?? false));

  const riskLevel =
    firstResponseBreached || resolutionBreached
      ? 'breached'
      : firstResponseWarning || resolutionWarning || openEscalationTriggeredAt !== null
        ? 'at_risk'
        : 'normal';

  const escalationState =
    openEscalationTriggeredAt !== null
      ? 'escalated'
      : shouldAutoEscalate
        ? 'warning'
        : 'none';

  return {
    riskLevel,
    escalationState,
    firstResponseBreachedAt:
      firstResponseBreached && !snapshot.first_response_breached_at
        ? now.toISOString()
        : snapshot.first_response_breached_at,
    resolutionBreachedAt:
      resolutionBreached && !snapshot.resolution_breached_at
        ? now.toISOString()
        : snapshot.resolution_breached_at,
    warningSentAt:
      (firstResponseWarning || resolutionWarning || firstResponseBreached || resolutionBreached) &&
      !snapshot.warning_sent_at
        ? now.toISOString()
        : snapshot.warning_sent_at,
    escalationTriggeredAt:
      openEscalationTriggeredAt !== null
        ? new Date(openEscalationTriggeredAt).toISOString()
        : shouldAutoEscalate && !snapshot.escalation_triggered_at
          ? now.toISOString()
          : snapshot.escalation_triggered_at,
    isAtRisk: riskLevel !== 'normal',
  } as const;
}
