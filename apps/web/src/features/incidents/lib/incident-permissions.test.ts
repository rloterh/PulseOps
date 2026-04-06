import { describe, expect, it } from 'vitest';
import { canCreateIncidents } from './incident-permissions';

describe('canCreateIncidents', () => {
  it('allows every active workspace role to report incidents', () => {
    expect(canCreateIncidents('owner')).toBe(true);
    expect(canCreateIncidents('admin')).toBe(true);
    expect(canCreateIncidents('manager')).toBe(true);
    expect(canCreateIncidents('agent')).toBe(true);
  });
});
