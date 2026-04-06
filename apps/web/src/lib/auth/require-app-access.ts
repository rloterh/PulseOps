import 'server-only';

import { requireUser } from './require-user';

export async function requireAppAccess() {
  const user = await requireUser();

  return { user };
}
