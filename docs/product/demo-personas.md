# Demo Personas

These demo personas are for local and reviewer environments only. They should not be used as production credentials.

Shared local demo password: `DemoPass123!`

Create or refresh these users with `corepack pnpm seed:demo` after local Supabase is running and `.env.local` includes `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.

## Owner

- Email: `owner@pulseops-demo.com`
- Role: organization owner
- Use this account to demo: dashboard overview, branch comparison, AI executive summary, billing state, audit center, incident center
- Best routes: `/dashboard`, `/analytics`, `/analytics/branches`, `/billing`, `/admin/activity`

## Admin

- Email: `admin@pulseops-demo.com`
- Role: organization admin
- Use this account to demo: incident escalation, admin activity review, settings, team coordination
- Best routes: `/incidents`, `/admin/activity`, `/team`, `/settings`

## Toronto Branch Manager

- Email: `manager.toronto@pulseops-demo.com`
- Role: branch manager
- Use this account to demo: branch-scoped jobs, filters, saved views, task coordination, SLA drift
- Best routes: `/jobs`, `/tasks`, `/analytics/sla`

## Toronto Operator

- Email: `operator.toronto@pulseops-demo.com`
- Role: field/operator user
- Use this account to demo: assigned work, job detail, task updates, operational history
- Best routes: `/jobs`, `/tasks`, `/inbox`

## Finance

- Email: `finance@pulseops-demo.com`
- Role: finance/admin stakeholder
- Use this account to demo: subscription state, pricing, billing portal handoff, past-due copy
- Best routes: `/billing`, `/pricing`

## Demo Notes

- Use seeded demo data so dashboards, analytics, audit logs, and notifications are populated.
- Keep the owner account as the primary walkthrough account.
- Use branch manager/operator personas to demonstrate role-based product thinking without overclaiming permissions that are not present.
