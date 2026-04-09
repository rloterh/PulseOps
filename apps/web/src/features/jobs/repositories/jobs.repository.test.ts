import { describe, expect, it, vi } from 'vitest';
import { getJobMutationTargetFromDb } from './jobs.repository';

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
        id: 'job-1',
        title: 'Generator repair',
        status: 'new',
        assignee_user_id: null,
        location_id: 'branch-1',
      },
      error: null,
    }),
  };

  return {
    eqCalls,
    query,
    supabase: {
      from: vi.fn().mockReturnValue(query),
    } as unknown as Parameters<typeof getJobMutationTargetFromDb>[0],
  };
}

describe('getJobMutationTargetFromDb', () => {
  it('applies branch scope when a branch id is provided', async () => {
    const { supabase, eqCalls } = createSupabaseMock();

    await getJobMutationTargetFromDb(supabase, {
      tenantId: 'org-1',
      branchId: 'branch-1',
      jobId: 'job-1',
    });

    expect(eqCalls).toContainEqual(['location_id', 'branch-1']);
  });

  it('does not apply branch scope when branch id is null', async () => {
    const { supabase, eqCalls } = createSupabaseMock();

    await getJobMutationTargetFromDb(supabase, {
      tenantId: 'org-1',
      branchId: null,
      jobId: 'job-1',
    });

    expect(eqCalls.find(([column]) => column === 'location_id')).toBeUndefined();
  });
});
