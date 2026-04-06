import { describe, expect, it } from 'vitest';
import { isMemberSelectionAllowed } from './member-selection';

describe('isMemberSelectionAllowed', () => {
  const members = [
    { id: '11111111-1111-1111-1111-111111111111' },
    { id: '22222222-2222-2222-2222-222222222222' },
  ];

  it('allows clearing an assignee', () => {
    expect(isMemberSelectionAllowed(members, null)).toBe(true);
  });

  it('allows selecting an organization member', () => {
    expect(
      isMemberSelectionAllowed(members, '11111111-1111-1111-1111-111111111111'),
    ).toBe(true);
  });

  it('rejects selecting a non-member user id', () => {
    expect(
      isMemberSelectionAllowed(members, '33333333-3333-3333-3333-333333333333'),
    ).toBe(false);
  });
});
