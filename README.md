# PulseOps

PulseOps is an operations command center for multi-location service businesses. The current `feature/production-hardening` branch carries the completed baseline through Sprint 10 and continues Sprint 11 hardening on top of that production-shaped product surface.

## Branch Status

Current branch: `feature/production-hardening`

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
- Sprint 10 public landing, pricing, contact, blog, help center, docs, SEO support pages, and screenshot gallery foundations
- Sprint 11 hardening foundation for shared safe errors, rate limiting, resilience states, and app-shell accessibility primitives

What this branch specifically adds beyond the completed Sprint 10 baseline:

- centralized safe-error helpers for APIs and future server actions
- request fingerprinting plus shared rate-limit utilities
- stronger default security headers and reduced-motion/focus-visible globals
- shared loading, empty, and error-state primitives for the app shell
- root skip-link, live-announcer placeholders, and focus boundary support
- analytics export, analytics JSON, and AI routes use safe error responses, structured logging, and route-level rate limiting
- auth, billing, operations, collaboration, saved-view, and notification mutations use shared action-level rate limiting
- job/task create and edit flows plus workspace bootstrap are now covered by the same action-level abuse controls
- accessibility primitives and performance review helpers are in place for the remaining manual hardening sweep

What this branch does not claim yet:

- final browser-level accessibility and performance QA across the most interaction-heavy surfaces
- upload hardening adoption on a production upload endpoint, because no real upload endpoint exists yet

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

### Sprint 11 Hardening Foundations

- root `loading`, `error`, `global-error`, and `not-found` states now use shared resilience primitives
- the app shell now exposes a skip link, focus boundary, and live-announcer regions for better keyboard support
- analytics export and AI routes now use safe error responses, structured logging, and route-level rate limiting
- billing checkout, billing portal, subscription renewal, and operations write actions now use shared server-action rate limiting
- auth, collaboration, saved-view, notification, and analytics JSON routes now have the same abuse-prevention posture
- job/task create and edit plus workspace bootstrap are covered by the shared action-rate-limit layer
- stronger default cross-origin and permissions headers are applied through `next.config.ts`
- early hardening docs are in place for checklist, security review, rate-limit matrix, and upload policy guidance
- shared accessibility primitives now cover icon buttons, form fields, and semantic table-empty rows
- lightweight performance helpers and review docs are in place for bundle and lazy-loading decisions

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
- ready for continued Sprint 11 hardening on top of the completed Sprint 10 platform baseline

## Next Likely Steps

- apply upload hardening when a production upload endpoint is introduced
- continue sweeping form-heavy and icon-only controls to adopt the new accessibility primitives where needed
- run the broader browser-level performance and bundle review pass for heavy analytics, AI, and admin surfaces
- lock in the final Sprint 11 test matrix and manual QA checklist

## Supporting Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Sprint 11 Security Review](./docs/security-review.md)
- [Sprint 11 Hardening Checklist](./docs/hardening-checklist.md)
- [Sprint 11 Rate Limit Matrix](./docs/rate-limit-matrix.md)
- [Sprint 11 Upload Policy](./docs/upload-policy.md)
- [Sprint 11 Accessibility QA](./docs/accessibility-qa.md)
- [Sprint 11 Performance Review](./docs/performance-review.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADR 0001](./docs/adr/0001-sprint-0-foundation.md)
