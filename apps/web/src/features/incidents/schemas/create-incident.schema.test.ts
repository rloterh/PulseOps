import { describe, expect, it } from 'vitest';
import { createIncidentSchema } from './create-incident.schema';

describe('createIncidentSchema', () => {
  it('normalizes optional incident create inputs', () => {
    expect(
      createIncidentSchema.parse({
        locationId: '11111111-1111-4111-8111-111111111111',
        title: ' North hub heating failure ',
        summary: 'The heating controls stopped responding for the occupied workspace wing.',
        customerName: 'North Hub Retail',
        severity: 'high',
        reportedAt: '',
        assigneeUserId: '',
        slaRisk: 'true',
        impactSummary: '  Frontline teams are working in reduced comfort.  ',
        nextAction: null,
      }),
    ).toMatchObject({
      locationId: '11111111-1111-4111-8111-111111111111',
      title: 'North hub heating failure',
      reportedAt: null,
      assigneeUserId: null,
      slaRisk: true,
      impactSummary: 'Frontline teams are working in reduced comfort.',
      nextAction: '',
    });
  });
});
