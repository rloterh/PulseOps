import { describe, expect, it, vi } from 'vitest';
import { getTaskMutationTargetFromDb } from './tasks.repository';

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
        id: 'task-1',
        title: 'Confirm site access',
        status: 'todo',
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
    } as unknown as Parameters<typeof getTaskMutationTargetFromDb>[0],
  };
}

describe('getTaskMutationTargetFromDb', () => {
  it('applies branch scope when a branch id is provided', async () => {
    const { supabase, eqCalls } = createSupabaseMock();

    await getTaskMutationTargetFromDb(supabase, {
      tenantId: 'org-1',
      branchId: 'branch-1',
      taskId: 'task-1',
    });

    expect(eqCalls).toContainEqual(['location_id', 'branch-1']);
  });

  it('does not apply branch scope when branch id is null', async () => {
    const { supabase, eqCalls } = createSupabaseMock();

    await getTaskMutationTargetFromDb(supabase, {
      tenantId: 'org-1',
      branchId: null,
      taskId: 'task-1',
    });

    expect(eqCalls.find(([column]) => column === 'location_id')).toBeUndefined();
  });
});
