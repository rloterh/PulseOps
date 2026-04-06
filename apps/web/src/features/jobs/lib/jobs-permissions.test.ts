import { describe, expect, it } from 'vitest';
import { canCreateJobs } from './jobs-permissions';

describe('canCreateJobs', () => {
  it('allows owners, admins, and managers', () => {
    expect(canCreateJobs('owner')).toBe(true);
    expect(canCreateJobs('admin')).toBe(true);
    expect(canCreateJobs('manager')).toBe(true);
  });

  it('rejects agents', () => {
    expect(canCreateJobs('agent')).toBe(false);
  });
});
