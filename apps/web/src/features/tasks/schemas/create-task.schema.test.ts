import { describe, expect, it } from 'vitest';
import { createTaskSchema } from './create-task.schema';

describe('createTaskSchema', () => {
  it('normalizes optional task fields', () => {
    expect(
      createTaskSchema.parse({
        locationId: '11111111-1111-4111-8111-111111111111',
        title: ' Confirm fallback plan ',
        summary: 'Review the task owner handoff before the morning shift starts.',
        priority: 'medium',
        dueAt: '',
        assigneeUserId: '',
        linkedEntityKind: 'none',
        linkedEntityId: '',
        completionSummary: null,
      }),
    ).toMatchObject({
      dueAt: null,
      assigneeUserId: null,
      linkedEntityId: null,
      completionSummary: '',
    });
  });

  it('requires a linked record id when a link type is selected', () => {
    expect(() =>
      createTaskSchema.parse({
        locationId: '11111111-1111-4111-8111-111111111111',
        title: 'Follow up',
        summary: 'Coordinate the follow-up action for the open record.',
        priority: 'high',
        linkedEntityKind: 'incident',
        linkedEntityId: '',
      }),
    ).toThrow();
  });
});
