import { describe, expect, it } from 'vitest';
import { canCreateTasks } from './task-permissions';

describe('canCreateTasks', () => {
  it('allows every active workspace role to open action tasks', () => {
    expect(canCreateTasks('owner')).toBe(true);
    expect(canCreateTasks('admin')).toBe(true);
    expect(canCreateTasks('manager')).toBe(true);
    expect(canCreateTasks('agent')).toBe(true);
  });
});
