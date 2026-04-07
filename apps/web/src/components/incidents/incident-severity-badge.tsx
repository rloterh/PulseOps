import { cn } from '@pulseops/utils';
import type { IncidentSeverity } from '@/features/incidents/types/incident.types';
import { getIncidentSeverityPresentation } from '@/features/incidents/lib/get-incident-severity-presentation';

const SEVERITY_CLASSES: Record<IncidentSeverity, string> = {
  critical: 'border-rose-300/24 bg-rose-300/14 text-rose-50',
  high: 'border-orange-300/24 bg-orange-300/12 text-orange-50',
  medium: 'border-amber-300/22 bg-amber-300/10 text-amber-100',
  low: 'border-sky-300/22 bg-sky-300/10 text-sky-100',
};

export function IncidentSeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const presentation = getIncidentSeverityPresentation(severity);

  return (
    <span
      title={presentation.label}
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
        SEVERITY_CLASSES[severity],
      )}
    >
      {presentation.code}
    </span>
  );
}
