import { describe, expect, it } from 'vitest';
import { canViewAuditActivity } from './audit.permissions';

describe('canViewAuditActivity', () => {
  it('allows owner admin and manager roles', () => {
    expect(canViewAuditActivity('owner')).toBe(true);
    expect(canViewAuditActivity('admin')).toBe(true);
    expect(canViewAuditActivity('manager')).toBe(true);
  });

  it('blocks agent role', () => {
    expect(canViewAuditActivity('agent')).toBe(false);
  });
});
