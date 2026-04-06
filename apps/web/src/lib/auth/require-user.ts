import 'server-only';

import { redirect } from 'next/navigation';
import { getSessionUser } from './get-session-user';

export async function requireUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}
