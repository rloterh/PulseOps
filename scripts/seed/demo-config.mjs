import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const requireFromWeb = createRequire(
  new URL('../../apps/web/package.json', import.meta.url),
);

const { createClient } = requireFromWeb('@supabase/supabase-js');

loadEnvFiles();

export const DEMO_ORG_SLUG = 'northstar-facility-services';
export const DEMO_ORG_NAME = 'Northstar Facility Services';
export const DEMO_EMAIL_DOMAIN = 'pulseops-demo.com';
export const DEFAULT_DEMO_PASSWORD = 'DemoPass123!';

export const DEMO_ACCOUNTS = [
  {
    key: 'owner',
    email: 'owner@pulseops-demo.com',
    fullName: 'Avery Morgan',
    role: 'owner',
    title: 'Operations Owner',
    allLocations: true,
  },
  {
    key: 'admin',
    email: 'admin@pulseops-demo.com',
    fullName: 'Priya Shah',
    role: 'admin',
    title: 'Platform Administrator',
    allLocations: true,
  },
  {
    key: 'managerToronto',
    email: 'manager.toronto@pulseops-demo.com',
    fullName: 'Marcus Chen',
    role: 'manager',
    title: 'Toronto Branch Manager',
    branchCodes: ['TOR'],
  },
  {
    key: 'operatorToronto',
    email: 'operator.toronto@pulseops-demo.com',
    fullName: 'Elena Rossi',
    role: 'agent',
    title: 'Toronto Field Operator',
    branchCodes: ['TOR'],
  },
  {
    key: 'managerVancouver',
    email: 'manager.vancouver@pulseops-demo.com',
    fullName: 'Noah Campbell',
    role: 'manager',
    title: 'Vancouver Branch Manager',
    branchCodes: ['VAN'],
  },
  {
    key: 'operatorVancouver',
    email: 'operator.vancouver@pulseops-demo.com',
    fullName: 'Harper Singh',
    role: 'agent',
    title: 'Vancouver Field Operator',
    branchCodes: ['VAN'],
  },
  {
    key: 'operatorCalgary',
    email: 'operator.calgary@pulseops-demo.com',
    fullName: 'Sam Taylor',
    role: 'agent',
    title: 'Calgary Field Operator',
    branchCodes: ['CAL'],
  },
  {
    key: 'finance',
    email: 'finance@pulseops-demo.com',
    fullName: 'Jordan Lee',
    role: 'admin',
    title: 'Finance Lead',
    allLocations: true,
  },
];

export const DEMO_BRANCHES = [
  {
    key: 'toronto',
    code: 'TOR',
    name: 'Toronto Central',
    timezone: 'America/Toronto',
  },
  {
    key: 'vancouver',
    code: 'VAN',
    name: 'Vancouver West',
    timezone: 'America/Vancouver',
  },
  {
    key: 'calgary',
    code: 'CAL',
    name: 'Calgary North',
    timezone: 'America/Edmonton',
  },
  {
    key: 'ottawa',
    code: 'OTT',
    name: 'Ottawa East',
    timezone: 'America/Toronto',
  },
];

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and add local Supabase values before seeding.',
    );
  }

  assertSafeDemoSeedTarget(supabaseUrl);

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getDemoPassword() {
  return process.env.PULSEOPS_DEMO_PASSWORD || DEFAULT_DEMO_PASSWORD;
}

export async function expectData(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  return result.data;
}

export async function expectOk(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
}

export async function findDemoUsers(supabase) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new Error(`List auth users: ${error.message}`);
    }

    users.push(...data.users);

    if (data.users.length < 100) {
      break;
    }

    page += 1;
  }

  const demoEmails = new Set(DEMO_ACCOUNTS.map((account) => account.email));
  return users.filter((user) => user.email && demoEmails.has(user.email));
}

export function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function assertSafeDemoSeedTarget(supabaseUrl) {
  if (process.env.PULSEOPS_ALLOW_REMOTE_DEMO_SEED === 'true') {
    return;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL "${supabaseUrl}". Demo seeding only supports a local Supabase target by default.`,
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isLocalHost =
    hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '0.0.0.0';

  if (!isLocalHost) {
    throw new Error(
      `Refusing to seed demo data against non-local Supabase target "${supabaseUrl}". Update .env.local to your local Supabase URL or set PULSEOPS_ALLOW_REMOTE_DEMO_SEED=true only if you intentionally want a remote seed.`,
    );
  }
}

function loadEnvFiles() {
  for (const fileName of ['.env.local', '.env']) {
    const filePath = resolve(process.cwd(), fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    const contents = readFileSync(filePath, 'utf8');

    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);

      if (!match || match[1].startsWith('#') || process.env[match[1]]) {
        continue;
      }

      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}
