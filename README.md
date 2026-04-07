# PulseOps

PulseOps is an operations command center for multi-location service businesses. The current `feature/analytics-insights` branch carries the full `dev` baseline through completed Sprint 7 incident and audit work, then layers the active Sprint 8 analytics slices on top.

## Branch Status

Current branch: `feature/analytics-insights`

This branch currently includes:

- the Sprint 0 foundation workspace, web app scaffold, shared packages, CI baseline, and local development tooling
- Sprint 1 auth, onboarding, organization tenancy, and branch-aware starter workspace bootstrap
- Sprint 2 protected shell, dashboard, navigation, command palette, notifications shell, and branch context
- Sprint 3 incidents, jobs, timelines, assignments, and typed operational repositories
- Sprint 4 intake, edit flows, collaboration, watchers, notifications, and inbox triage
- Sprint 5 list productivity upgrades, saved views, bulk workflows, and E2E scaffolding
- Sprint 6 billing and Stripe checkout, portal, webhook sync, entitlement mapping, and premium gating
- Sprint 7 incident escalation, live SLA state, audit logging, and admin activity review
- Sprint 8A analytics foundation, overview KPIs, trend charts, and analytics index tuning
- Sprint 8B branch comparison rankings, side-by-side performance tables, and comparison API surfaces
- Sprint 8C SLA metrics page, breakdowns, and evaluation API surfaces
- Sprint 8D CSV export-ready analytics tables and authenticated export route

What this branch specifically adds beyond `dev`:

- shared analytics filters, date-range resolution, and permission helpers aligned to the current organization and branch model
- an actual `/analytics` overview instead of the old billing-gated placeholder copy
- overview KPI cards for job volume, backlog, incidents, median resolution time, and SLA attainment
- lightweight overview trend and breakdown charts built directly into the app without introducing a separate chart stack
- `/api/analytics/overview` server response for the first analytics dataset
- targeted analytics index tuning for jobs, incidents, and `work_item_slas`
- shell navigation entry for Analytics so the new sprint surface is discoverable
- `/analytics/branches` route for branch-level throughput and SLA comparison
- `/api/analytics/branches` server response for branch comparison datasets
- branch comparison rankings for resolved volume, first response SLA, and breach concentration
- side-by-side branch table covering created work, resolved work, backlog, backlog delta, incidents, SLA rates, and breaches
- `/analytics/sla` route for service-target attainment, timing distribution, and breach review
- `/api/analytics/sla` server response for SLA summary, breakdown, and evaluation datasets
- SLA summary cards for first response and resolution attainment plus median and p95 timing
- branch, priority, and severity breakdown tables with record-level evaluation review
- authenticated `/api/analytics/export` route for stable branch-comparison and SLA CSV downloads
- export links wired directly into the branch-comparison and SLA table surfaces

What this branch does not claim yet:

- warehouse-style BI or forecasting features
- custom dashboard builders or later-sprint reporting features

## Product Surface

Key live surfaces on this branch:

- marketing pages including `/`, `/pricing`, `/docs`, and `/contact`
- auth routes including `/sign-in`, `/sign-up`, `/verify`, `/callback`, and `/onboarding`
- protected operations surfaces including `/dashboard`, `/branches`, `/incidents`, `/jobs`, `/tasks`, `/team`, `/inbox`, `/analytics`, `/billing`, and `/settings`
- privileged admin review at `/admin/activity`

The route structure follows PulseOps-native concepts such as organizations, locations, incidents, jobs, and tasks. This branch does not introduce a parallel generic workspace or work-item model.

## Branch Highlights

### Operations And Collaboration

- real incidents, jobs, and tasks with branch-aware reads, filters, detail views, and timelines
- secure create, edit, assignment, and status flows with server-side validation
- collaboration panels, internal notes, mentions-ready comment markup, watcher enrollment, and notification fan-out
- inbox triage and notification panel backed by persistent notification data

### Billing And Entitlements

- public pricing page with live checkout entry points
- protected billing page with plan, entitlement, trial, cancellation, and payment-state visibility
- Stripe checkout, plan change, cancel or resume, and billing-portal launch flows
- webhook ingestion with idempotent event recording and subscription sync
- server-side entitlement enforcement for premium analytics, saved views, and advanced list filters

### Sprint 7 Incident And Audit Foundation

- `incident_escalations` table with escalation level, target metadata, acknowledgement fields, and response-state tracking
- `audit_logs` table with append-only storage and privileged read access
- additive incident fields for `acknowledged_at`, `closed_at`, `escalation_level`, and `last_activity_at`
- tested SLA status-category helpers and typed SLA repository wrappers to support future evaluator work
- initial admin activity page backed by typed audit queries and summary cards
- interactive admin activity table with metadata drawer, pagination links, and audit-view logging
- manual escalation and acknowledgement actions embedded into the incident detail flow
- escalation-aware timeline entries, record notifications, and audit log writes
- server-side admin activity filters for actor, branch, scope, and target entity review
- billing checkout, portal, and cancellation-control actions now mirrored into the audit trail
- incident detail now shows live SLA state, due windows, breach timing, and escalation health
- incident create, edit, status, and escalation flows now recompute SLA snapshots instead of leaving the SLA tables passive

### Sprint 8 Analytics Foundation

- `/analytics` now renders real operational reporting instead of a placeholder message
- overview KPIs compare the active reporting window with the immediate previous period
- trend visualisation covers created jobs, resolved jobs, and incident openings over time
- breakdown views show current-window jobs by status and priority
- branch-aware analytics filtering is supported through the existing shell branch context plus explicit analytics filters
- the first analytics API route and shared analytics helpers are in place for later Sprint 8 slices
- analytics-focused indexes are applied for jobs, incidents, and SLA snapshot queries

### Sprint 8 Branch Comparison

- `/analytics/branches` compares branch-level throughput, incident pressure, and SLA performance
- branch rankings surface resolved volume, first response SLA attainment, and breach concentration
- the comparison table includes backlog delta versus the previous period when compare mode is enabled
- the analytics shell now links directly between overview and branch comparison views

### Sprint 8 SLA Metrics

- `/analytics/sla` reports first response and resolution attainment using the existing `work_item_slas` foundation
- SLA summary cards show first response rate, resolution rate, and median/p95 timings
- breakdown tables cover branch, priority, and severity cohorts
- record-level evaluation rows expose the exact items behind the aggregate SLA metrics

### Sprint 8 Export-Ready Tables

- branch comparison and SLA evaluation tables now expose stable CSV download flows
- export URLs preserve the current analytics filters and stay server-generated
- `/api/analytics/export` enforces the same analytics access and billing entitlement checks as the live pages
- CSV serialization is centralized so exported contracts stay stable across future analytics slices

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- Supabase
- Turborepo
- pnpm workspaces
- Vitest and Testing Library
- Playwright scaffolding
- GitHub Actions
- Docker

## Repo Layout

```text
.
|- apps/
|  `- web/
|- packages/
|  |- config-eslint/
|  |- config-prettier/
|  |- config-typescript/
|  |- env/
|  |- supabase/
|  |- ui/
|  `- utils/
|- supabase/
|- docs/
`- docker/
```

## Database Status

Current schema scope on this branch includes:

- `profiles`
- `organizations`
- `organization_members`
- `locations`
- `location_member_access`
- `incidents`
- `incident_timeline_events`
- `incident_escalations`
- `jobs`
- `job_timeline_events`
- `tasks`
- `task_timeline_events`
- `record_comments`
- `record_comment_mentions`
- `record_watchers`
- `record_notifications`
- `organization_reference_counters`
- `sla_policies`
- `work_item_slas`
- `billing_customers`
- `billing_subscriptions`
- `billing_events`
- `organization_entitlements`
- `audit_logs`
- analytics-focused indexes on `jobs`, `incidents`, and `work_item_slas`

This is now a meaningful operational SaaS schema, though it is still not the full long-term PulseOps domain model.

## Running This Branch

### Prerequisites

- Node.js 22+
- Corepack enabled

### Install

```bash
corepack pnpm install
```

### Start the app

```bash
corepack pnpm dev
```

### Start local Supabase

```bash
corepack pnpm exec supabase start
corepack pnpm exec supabase db reset
```

### Verify the branch

```bash
corepack pnpm check
```

### Optional billing and E2E validation

- configure Stripe environment variables before exercising checkout, portal, and webhook flows
- provide Playwright E2E credentials before running the authenticated browser suite

## Environment Setup

Copy the example file:

```bash
cp .env.example .env.local
```

Core local variables:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Important behavior on this branch:

- the public shell can still boot locally without Supabase env values
- auth, onboarding, dashboard, analytics, billing, and admin activity flows require valid Supabase configuration
- Stripe flows require the billing-specific env values documented in [`docs/setup/local-development.md`](./docs/setup/local-development.md)

## Quality Bar On This Branch

This branch is meant to stay:

- typed
- linted
- tested
- buildable
- documented
- production-minded in validation and authorization
- ready for final Sprint 8 QA and follow-up polish only

## Next Likely Steps

- polish analytics loading, empty, and error states further if live QA reveals rough edges
- run explain-plan review on analytics queries against local seeded Supabase data
- begin Sprint 9 AI layer only after Sprint 8 sign-off if you want to keep canonical order strict

## Supporting Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADR 0001](./docs/adr/0001-sprint-0-foundation.md)
