import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEMO_EMAIL_DOMAIN,
  DEMO_ORG_SLUG,
  createAdminClient,
  expectData,
  expectOk,
  findDemoUsers,
} from './demo-config.mjs';

export async function resetDemoData(supabase = createAdminClient()) {
  const organization = await expectData(
    supabase
      .from('organizations')
      .select('id')
      .eq('slug', DEMO_ORG_SLUG)
      .maybeSingle(),
    'Find demo organization',
  );

  if (organization?.id) {
    await expectOk(
      supabase.from('organizations').delete().eq('id', organization.id),
      'Delete demo organization',
    );
  }

  await expectOk(
    supabase.from('billing_events').delete().like('stripe_event_id', 'evt_demo_%'),
    'Delete demo billing events',
  );

  await expectOk(
    supabase.from('profiles').delete().like('email', `%@${DEMO_EMAIL_DOMAIN}`),
    'Delete orphan demo profiles',
  );

  const demoUsers = await findDemoUsers(supabase);

  for (const user of demoUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      throw new Error(`Delete demo auth user ${user.email}: ${error.message}`);
    }
  }

  return {
    deletedOrganization: Boolean(organization?.id),
    deletedUsers: demoUsers.length,
  };
}

async function main() {
  const result = await resetDemoData();
  console.log(
    `Reset demo data. Organization removed: ${result.deletedOrganization}. Users removed: ${result.deletedUsers}.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
