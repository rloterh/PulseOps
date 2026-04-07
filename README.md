# PulseOps

PulseOps is an operations command center for multi-location service businesses. The current `feature/cms-marketing-platform` branch carries the full `dev` baseline through completed Sprint 9 AI work, then layers the active Sprint 10 marketing and CMS foundations on top.

## Branch Status

Current branch: `feature/cms-marketing-platform`

This branch currently includes:

- the Sprint 0 foundation workspace, web app scaffold, shared packages, CI baseline, and local development tooling
- Sprint 1 auth, onboarding, organization tenancy, and branch-aware starter workspace bootstrap
- Sprint 2 protected shell, dashboard, navigation, command palette, notifications shell, and branch context
- Sprint 3 incidents, jobs, timelines, assignments, and typed operational repositories
- Sprint 4 intake, edit flows, collaboration, watchers, notifications, and inbox triage
- Sprint 5 list productivity upgrades, saved views, bulk workflows, and E2E scaffolding
- Sprint 6 billing and Stripe checkout, portal, webhook sync, entitlement mapping, and premium gating
- Sprint 7 incident escalation, live SLA state, audit logging, and admin activity review
- Sprint 8 analytics overview, branch comparison, SLA metrics, and export-ready analytics reporting
- Sprint 9 AI executive summaries, late-job risk signals, branch synthesis, explanation UI, run persistence, and feedback capture
- Sprint 10A shared marketing foundation, refreshed landing page, pricing system refresh, public contact surface, and initial public route boundaries for blog, help, and screenshots

What this branch specifically adds beyond `dev`:

- a proper public marketing header and footer instead of the older placeholder shell
- a polished landing page that explains PulseOps as an AI-powered operations command center instead of a stale Sprint 1 splash page
- a real public pricing surface aligned to the live Stripe billing plans and entitlement model
- a non-placeholder public contact page for rollout, sales, and support conversations
- stable public route boundaries for `/blog`, `/help`, and `/screenshots` so the rest of Sprint 10 can layer content onto the correct IA without changing public URLs

What this branch does not claim yet:

- the full Sprint 10 content layer yet
- blog, help center, docs, SEO pages, or screenshot gallery completion beyond the first public route foundations
- any later CMS admin or marketing automation work beyond Sprint 10 scope

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

### Sprint 9 AI Layer Foundations

- executive-summary guidance is generated from live analytics signals with explicit confidence and next-step copy
- branch summary cards surface localized backlog pressure, overdue concentration, incident activity, and breach counts
- late-job risk signals combine due-date pressure, priority, blocker state, and SLA risk into explainable job rankings
- `/analytics` now includes AI-style explanation UI without relying on disconnected placeholder prompts
- branch and late-job signals now expose inspectable explanation sheets with concrete supporting facts instead of only inline copy
- the executive summary now exposes its own supporting facts and connects directly to downstream operational views
- AI outputs now persist as traceable runs with feedback capture instead of only existing as server-rendered copy
- branch comparison now generates its own AI summary, strongest-branch callout, highest-risk branch callout, and recommended next moves

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
- `ai_runs`
- `ai_feedback`
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
- ready for Sprint 9 continuation on top of the completed Sprint 8 analytics baseline

## Next Likely Steps

- add richer AI explanation drill-downs and more nuanced executive narratives
- expand late-job risk modelling beyond the first explainable heuristics layer
- add job-specific focused AI explanation routes on top of the run/feedback backbone
- decide whether a later Sprint 9 follow-up should keep the deterministic provider or add a live LLM provider on top of the new run/feedback backbone
- keep analytics performance under review with local explain-plan checks against seeded Supabase data

## Supporting Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADR 0001](./docs/adr/0001-sprint-0-foundation.md)
