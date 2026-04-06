import { describe, expect, it } from 'vitest';
import { updateTaskSchema } from './task-mutation.schemas';

describe('updateTaskSchema', () => {
  it('requires a linked record id when a link type is selected', () => {
    const result = updateTaskSchema.safeParse({
      taskId: '11111111-1111-1111-1111-111111111111',
      title: 'Confirm rooftop access',
      summary: 'Call facilities and confirm the access window for the vendor team.',
      priority: 'high',
      dueAt: null,
      linkedEntityKind: 'job',
      linkedEntityId: null,
      completionSummary: '',
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (issue) => issue.message === 'Choose the linked record you want this task to track.',
      ),
    ).toBe(true);
  });
});
