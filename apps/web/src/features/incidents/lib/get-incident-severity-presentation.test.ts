import { describe, expect, it } from 'vitest';
import { getIncidentSeverityPresentation } from './get-incident-severity-presentation';

describe('getIncidentSeverityPresentation', () => {
  it('maps critical incidents to the canonical sev1 presentation', () => {
    expect(getIncidentSeverityPresentation('critical')).toEqual({
      code: 'Sev 1',
      label: 'Critical',
    });
  });

  it('maps low incidents to the canonical sev4 presentation', () => {
    expect(getIncidentSeverityPresentation('low')).toEqual({
      code: 'Sev 4',
      label: 'Low',
    });
  });
});
