import { describe, expect, it } from 'vitest';
import { isNavItemActive } from './navigation';

describe('isNavItemActive', () => {
  it('matches exact routes exactly', () => {
    expect(isNavItemActive('/dashboard', '/dashboard', 'exact')).toBe(true);
    expect(isNavItemActive('/dashboard/stats', '/dashboard', 'exact')).toBe(false);
  });

  it('matches nested routes for startsWith items', () => {
    expect(isNavItemActive('/jobs', '/jobs', 'startsWith')).toBe(true);
    expect(isNavItemActive('/jobs/queue', '/jobs', 'startsWith')).toBe(true);
    expect(isNavItemActive('/job-board', '/jobs', 'startsWith')).toBe(false);
    expect(isNavItemActive('/tasks/new', '/tasks', 'startsWith')).toBe(true);
  });
});
