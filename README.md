# PulseOps

PulseOps is an operations command center for multi-location service businesses. The current `feature/sla-escalations-activity-audit` branch carries the full `dev` baseline through completed Sprint 6 billing, then layers the first Sprint 7 foundations for SLA-aware incident operations, escalation storage, and append-only admin audit visibility on top.

## Branch Status

Current branch: `feature/sla-escalations-activity-audit`

This branch currently includes:

- the Sprint 0 foundation workspace, web app scaffold, shared packages, CI baseline, and local development tooling
- Sprint 1 auth, onboarding, organization tenancy, and branch-aware starter workspace bootstrap
- Sprint 2 protected shell, dashboard, navigation, command palette, notifications shell, and branch context
- Sprint 3 incidents, jobs, timelines, assignments, and typed operational repositories
- Sprint 4 intake, edit flows, collaboration, watchers, notifications, and inbox triage
- Sprint 5 list productivity upgrades, saved views, bulk workflows, and E2E scaffolding
- Sprint 6 billing and Stripe checkout, portal, webhook sync, entitlement mapping, and premium gating
- Sprint 7A, 7B, and 7C incident foundations for escalations, audit logging, admin activity review, and manual escalation handling

What this branch specifically adds beyond `dev`:

- SLA policy storage and per-record SLA snapshots for incidents, jobs, and tasks
- additive `first_response_at` and `resolved_at` timestamps on operational records
- incident escalation storage with organization and branch scoping
- append-only audit logs for sensitive operator and billing activity
- protected `/admin/activity` review for privileged workspace operators
- canonical incident severity presentation aligned to escalation-friendly `Sev 1` to `Sev 4` language
- audit writes from incident create, assignment, and status mutation flows
- manual incident escalation and acknowledgement actions with timeline, notification, and audit coverage
- filterable admin activity review plus billing control-path audit logging for sensitive commercial actions

What this branch does not claim yet:

- automated SLA evaluation and breach detection
- broader escalation execution automation beyond the manual and acknowledgement flow
- full cross-record activity feed UX
- complete audit-log coverage across every sensitive mutation
- customer portal, invoice center, seat billing, or usage metering beyond the Sprint 6 billing scope already merged from `dev`

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
- manual escalation and acknowledgement actions embedded into the incident detail flow
- escalation-aware timeline entries, record notifications, and audit log writes
- server-side admin activity filters for actor, branch, scope, and target entity review
- billing checkout, portal, and cancellation-control actions now mirrored into the audit trail

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
- auth, onboarding, dashboard, billing, and admin activity flows require valid Supabase configuration
- Stripe flows require the billing-specific env values documented in [`docs/setup/local-development.md`](./docs/setup/local-development.md)

## Quality Bar On This Branch

This branch is meant to stay:

- typed
- linted
- tested
- buildable
- documented
- production-minded in validation and authorization
- ready for the next Sprint 7 slices on evaluator logic, automated escalations, and richer activity surfaces

## Next Likely Steps

- automate SLA evaluation and breach-risk calculation
- add escalation execution automation and responder-targeting rules
- expand audit coverage across more sensitive server actions
- add richer activity-feed surfaces on top of the new audit foundation
- harden admin review flows with deeper test coverage

## Supporting Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADR 0001](./docs/adr/0001-sprint-0-foundation.md)
