import 'server-only';

import { searchAssignableDirectory } from '@/features/directory/queries/search-assignable-directory';

export interface MemberOption {
  id: string;
  label: string;
  role: string;
  email: string | null;
  avatarUrl: string | null;
  isCurrentUser: boolean;
}

export async function getMemberOptions(
  organizationId: string,
  locationId?: string | null,
): Promise<MemberOption[]> {
  const users = await searchAssignableDirectory({
    organizationId,
    query: '',
    limit: 25,
    ...(locationId === undefined ? {} : { locationId }),
  });

  return users.map((user) => ({
    id: user.userId,
    label: user.fullName,
    role: user.role,
    email: user.email,
    avatarUrl: user.avatarUrl,
    isCurrentUser: user.isCurrentUser,
  }));
}
