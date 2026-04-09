import { describe, expect, it, vi } from 'vitest';
import { getIncidentMutationTargetFromDb } from './incidents.repository';

function createSupabaseMock() {
  const eqCalls: [string, unknown][] = [];
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn((column: string, value: unknown) => {
      eqCalls.push([column, value]);
      return query;
    }),
    maybeSingle: vi.fn().mockResolvedValue({
      data: {
        id: 'incident-1',
        title: 'Chiller failure',
        reference: 'INC-1001',
        status: 'open',
        assignee_user_id: null,
        location_id: 'branch-1',
        organization_id: 'org-1',
        severity: 'high',
        opened_at: '2026-04-09T09:00:00.000Z',
        first_response_at: null,
        acknowledged_at: null,
        resolved_at: null,
        closed_at: null,
      },
      error: null,
    }),
  };

  return {
    eqCalls,
    query,
    supabase: {
      from: vi.fn().mockReturnValue(query),
    } as unknown as Parameters<typeof getIncidentMutationTargetFromDb>[0],
  };
}

describe('getIncidentMutationTargetFromDb', () => {
  it('applies branch scope when a branch id is provided', async () => {
    const { supabase, eqCalls } = createSupabaseMock();

    await getIncidentMutationTargetFromDb(supabase, {
      tenantId: 'org-1',
      branchId: 'branch-1',
      incidentId: 'incident-1',
    });

    expect(eqCalls).toContainEqual(['location_id', 'branch-1']);
  });

  it('does not apply branch scope when branch id is null', async () => {
    const { supabase, eqCalls } = createSupabaseMock();

    await getIncidentMutationTargetFromDb(supabase, {
      tenantId: 'org-1',
      branchId: null,
      incidentId: 'incident-1',
    });

    expect(eqCalls.find(([column]) => column === 'location_id')).toBeUndefined();
  });
});
