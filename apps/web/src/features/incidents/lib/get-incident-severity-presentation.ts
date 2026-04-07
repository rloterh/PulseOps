import type { IncidentSeverity } from '@/features/incidents/types/incident.types';

export interface IncidentSeverityPresentation {
  code: 'Sev 1' | 'Sev 2' | 'Sev 3' | 'Sev 4';
  label: 'Critical' | 'High' | 'Medium' | 'Low';
}

const INCIDENT_SEVERITY_PRESENTATION: Record<
  IncidentSeverity,
  IncidentSeverityPresentation
> = {
  critical: {
    code: 'Sev 1',
    label: 'Critical',
  },
  high: {
    code: 'Sev 2',
    label: 'High',
  },
  medium: {
    code: 'Sev 3',
    label: 'Medium',
  },
  low: {
    code: 'Sev 4',
    label: 'Low',
  },
};

export function getIncidentSeverityPresentation(severity: IncidentSeverity) {
  return INCIDENT_SEVERITY_PRESENTATION[severity];
}
