import { formatDateTimeLabel } from '@/lib/formatting/format-date-time-label';
import type { SlaPolicyRecord, WorkItemSlaSnapshot } from '@/features/sla/types/sla.types';
import type { IncidentSlaSummary } from '@/features/incidents/types/incident.types';

function toOptionalLabel(value: string | null) {
  return value ? formatDateTimeLabel(value) : null;
}

export function buildIncidentSlaSummary(input: {
  snapshot: WorkItemSlaSnapshot | null;
  policy: SlaPolicyRecord | null;
}): IncidentSlaSummary | null {
  if (!input.snapshot) {
    return null;
  }

  return {
    riskLevel: input.snapshot.risk_level,
    escalationState: input.snapshot.escalation_state,
    statusCategory: input.snapshot.status_category,
    policyName: input.policy?.name ?? null,
    firstResponseDueAtLabel: toOptionalLabel(input.snapshot.first_response_due_at),
    resolutionDueAtLabel: toOptionalLabel(input.snapshot.resolution_due_at),
    firstRespondedAtLabel: toOptionalLabel(input.snapshot.first_responded_at),
    resolvedAtLabel: toOptionalLabel(input.snapshot.resolved_at),
    firstResponseBreachedAtLabel: toOptionalLabel(
      input.snapshot.first_response_breached_at,
    ),
    resolutionBreachedAtLabel: toOptionalLabel(input.snapshot.resolution_breached_at),
    warningSentAtLabel: toOptionalLabel(input.snapshot.warning_sent_at),
    escalationTriggeredAtLabel: toOptionalLabel(input.snapshot.escalation_triggered_at),
  };
}
