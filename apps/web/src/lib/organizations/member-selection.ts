import type { MemberOption } from './get-member-options';

export function isMemberSelectionAllowed(
  members: Pick<MemberOption, 'id'>[],
  userId: string | null,
) {
  if (userId === null) {
    return true;
  }

  return members.some((member) => member.id === userId);
}
