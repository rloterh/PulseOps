# Local Development

## Prerequisites

- Node.js 22 or newer
- Corepack enabled

## Bootstrapping

1. Run `corepack pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Start local Supabase with `corepack pnpm exec supabase start`.
4. Apply the current schema with `corepack pnpm exec supabase db reset`.
5. Add the local Supabase values to `.env.local`.
6. Start the app with `corepack pnpm dev`.

The `db reset` step applies the current local schema through the current branch baseline, including tenancy, operational records, collaboration, notifications, billing, audit logging, analytics, and the Sprint 9 AI run plus feedback tables.

## Demo Seed Flow

Sprint 12 adds a resettable local demo tenant for portfolio review.

1. Start Supabase with `corepack pnpm exec supabase start`.
2. Apply the schema with `corepack pnpm exec supabase db reset`.
3. Ensure `.env.local` includes `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `corepack pnpm seed:demo`.

The seed creates Northstar Facility Services with role-based demo users, four branches, jobs, incidents, tasks, timelines, notifications, billing state, SLA snapshots, saved views, audit logs, and AI run examples. Use `corepack pnpm seed:demo:reset` to remove the seeded tenant and demo users without resetting the full database.

The default demo password is `DemoPass123!`. Override it with `PULSEOPS_DEMO_PASSWORD` in `.env.local` for local reviewer environments.

## Verification

Run `corepack pnpm check` to execute linting, type-checking, tests, and builds across the workspace.

## E2E Testing

This branch includes Playwright scaffolding for the jobs and incidents list productivity flows.

1. Install browsers once with `corepack pnpm --filter @pulseops/web exec playwright install chromium`.
2. Ensure your local Supabase stack is running and the app can sign in normally.
3. Set these environment variables in the shell you use to run Playwright:
   - `E2E_USER_EMAIL`
   - `E2E_USER_PASSWORD`
4. Run `corepack pnpm test:e2e`.

Notes:

- the E2E tests currently target authenticated jobs and incidents list behavior
- they expect a user who can access the protected shell and view operational data
- if the E2E auth variables are missing, the Playwright specs are skipped rather than failing

## Package Manager Note

This repository is intentionally pinned to `pnpm`.

- Use `corepack pnpm install`
- Do not use `npm install`
- If `npm` was run against an existing pnpm-managed `node_modules`, delete `node_modules` and reinstall with `corepack pnpm install`

## Environment Note

The marketing shell can still run without Supabase env vars in local development. In that case, proxy-based session refresh is skipped until you add real values to `.env.local`.

Sprint 1 auth, onboarding, and protected dashboard flows require these values:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Sprint 6 billing adds these optional values when you want to test checkout, plan changes, cancel or resume actions, portal launch, or webhook flows locally:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_BUSINESS_MONTHLY`

If those Stripe variables are missing, the pricing and billing pages still render, but checkout and portal launch will redirect back with a clear “billing unavailable” state instead of crashing.

Sprint 9 adds these optional values when you want to experiment with future external AI-provider wiring locally:

- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `PULSEOPS_DEMO_PASSWORD`

If those AI variables are missing, PulseOps stays on the deterministic analytics AI layer and still records `ai_runs` plus operator feedback without crashing.

Sprint 3 builds on that foundation with the first real operational modules, so it is worth validating these browser flows locally after setup:

- sign in and sign out
- onboarding redirect behavior
- dashboard, branch navigation, incidents, and jobs
- incident and job detail screens, including linked records
- status and assignee updates for incidents and jobs
- command palette with `Ctrl+K`
