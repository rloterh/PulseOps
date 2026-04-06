import { describe, expect, it } from 'vitest';
import { resolveActiveBranchId } from './resolve-active-branch';

const branches = [
  {
    id: 'branch_1',
    name: 'Canary Wharf',
    code: 'cw',
    timezone: 'Europe/London',
    locationLabel: 'Timezone Europe/London',
    isActive: true,
  },
  {
    id: 'branch_2',
    name: 'Bristol',
    code: 'brs',
    timezone: 'Europe/London',
    locationLabel: 'Timezone Europe/London',
    isActive: false,
  },
] as const;

describe('resolveActiveBranchId', () => {
  it('prefers a matching stored branch id', () => {
    expect(resolveActiveBranchId([...branches], 'branch_2')).toBe('branch_2');
  });

  it('falls back to the current active branch when the preference is invalid', () => {
    expect(resolveActiveBranchId([...branches], 'missing')).toBe('branch_1');
  });

  it('returns null when no branches are available', () => {
    expect(resolveActiveBranchId([], null)).toBeNull();
  });
});
