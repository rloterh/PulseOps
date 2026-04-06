# PulseOps

PulseOps is an operations command center for multi-location service businesses. The current `feature/customers-billing-portal` branch now carries Sprint 4D work on top of the earlier foundation: authentication, workspace onboarding, database tenancy, a premium protected shell, real operational modules for incidents, jobs, and tasks, directory-backed creation flows, edit and reassignment workflows, collaboration on operational records, and now a real watcher-driven notification feed plus inbox triage surface.

This branch is still intentionally early-stage. It demonstrates the working auth and tenancy baseline without pretending the full operations platform is already built.

## Branch Status

Current branch: `feature/customers-billing-portal`

What this branch delivers:

- a `pnpm` workspace and Turborepo foundation
- a Next.js 16 App Router web app scaffold
- shared TypeScript, ESLint, and Prettier config packages
- typed environment validation with Zod
- Supabase client boundaries for browser, server, admin, and edge session refresh
- a real Supabase migration for profiles, organizations, memberships, and starter locations
- sign-up, sign-in, callback, verify, sign-out, and first-workspace onboarding flows
- a responsive protected shell with sidebar, topbar, mobile drawer, branch switcher, notifications shell, and command palette
- a richer dashboard scaffold with typed KPI and widget contracts
- real incidents and jobs list/detail surfaces with branch-aware reads, filters, timelines, and status or assignee mutation flows
- a branch-aware assignee directory with location-scoped eligibility checks
- production-grade create flows for incidents, jobs, and tasks with server-side validation, secure assignee enforcement, activity logging, and shell entry points
- a first-class tasks module with task list, detail, timeline, and optional linking to incidents or jobs
- record edit flows for incidents, jobs, and tasks with timeline-backed field history
- hardened reassignment and status updates that follow the record branch instead of the current shell branch
- collaboration panels on incident, job, and task detail screens
- comments and internal notes with secure server-side validation and deletion rules
- mentions-ready comment markup with org-safe member validation
- watcher subscriptions with auto-subscribe behavior for creators, assignees, and comment participants
- watcher-driven notifications for comments, mentions, assignments, status changes, and intake assignment events
- a real notification panel with unread counts and mark-read controls
- an inbox triage surface with unread, open, and archived views
- a Tailwind v4 design-token baseline and minimal UI primitives
- CI, Docker, docs, and verification tooling
- marketing and dashboard routes aligned to the PulseOps domain model

What this branch does not claim yet:

- analytics, billing, or customer workflows beyond scaffolded surfaces
- the final long-term tenant and branch schema for the whole product
- invitation flows, fine-grained permissions, or customer portal auth
- Stripe integration
- realtime updates or attachment uploads
- AI features beyond structural preparation

## Why This Branch Exists

PulseOps is intended to become a premium B2B SaaS platform, so this branch proves the first vertical slice on top of the earlier foundation:

- real auth and callback handling
- tenant bootstrap with RLS-backed organization membership
- protected routing and onboarding redirects
- org-scoped reads in the dashboard shell
- a professional base for later collaboration, customer, billing, and analytics work

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- Supabase
- Turborepo
- pnpm workspaces
- Vitest and Testing Library
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

## What Is Implemented

### Workspace Foundation

- Root workspace scripts and lockfile management
- Shared package boundaries for config, env parsing, Supabase, UI, and utilities
- Consistent lint, typecheck, test, and build commands through `corepack pnpm check`

### Web App Scaffold

- App Router route groups for marketing, auth, and dashboard surfaces
- Live routes for:
  - `/`
  - `/sign-in`
  - `/sign-up`
  - `/verify`
  - `/callback`
  - `/onboarding`
  - `/dashboard`
  - `/branches`
  - `/incidents`
  - `/incidents/new`
  - `/jobs`
  - `/jobs/new`
  - `/tasks`
  - `/tasks/new`
  - `/team`
  - `/inbox`
  - `/settings`
- Placeholder routes preserved for:
  - `/pricing`
  - `/docs`
  - `/contact`
  - `/analytics`
  - `/billing`
  - `/customers`
  - `/portal`
- Global layout, loading state, error boundary, not-found screen, and health endpoint

### Shared Infrastructure

- Zod-validated env access in `packages/env`
- Supabase client factories in `packages/supabase`
- Proxy-based session refresh and route protection
- Shell UI state managed in a focused client-side Zustand store
- Security headers baseline
- Lightweight logging helper

### Database And Tenancy

- Initial migration in `supabase/migrations/20260406_000001_sprint_1_auth_orgs.sql`
- Follow-up hardening migration in `supabase/migrations/20260406_000002_sprint_1_followups.sql`
- Profile bootstrap trigger from `auth.users`
- `organizations`, `organization_members`, and `locations` tables
- Starter RLS policies for self-profile access, org membership reads, workspace creation, and location access
- Retry-safe `bootstrap_organization` RPC to keep workspace onboarding atomic
- Seed data that creates a demo workspace and starter locations when a profile exists
- Location-scoped member access and directory search for safe assignee lookup
- Server-side reference generation for incidents, jobs, and tasks
- Task tables and timeline storage for the first lightweight follow-up workflow

### Sprint 4 Operations Delivery

- Real directory-backed assignee search for branch-aware intake flows
- New incident flow with severity, SLA-risk, timeline logging, and guarded assignment
- New job flow with server-generated references and intake timeline activity
- New task flow with optional linking to incidents or jobs in the same branch
- Edit screens for incidents, jobs, and tasks with branch-safe validation
- Status and assignee updates for all three operational record types
- Timeline entries that summarize before/after changes for status, ownership, and record edits
- Dashboard and module entry points for both create and edit flows
- Collaboration panels for incidents, jobs, and tasks
- Record comments and internal notes with soft-delete support
- Mention extraction and persistence for future notification fan-out
- Watch and mute controls with automatic watcher enrollment for participants
- Watcher-driven notification generation backed by a real notifications table
- Inbox triage actions for mark read, archive, restore, and bulk acknowledgement

### Sprint 2 Shell

- Premium dark app shell with responsive desktop and mobile navigation
- Branch switcher shell backed by current organization locations
- Notification panel and keyboard-triggered command palette
- Dashboard widgets fed by typed summary and notification contracts

### Delivery Baseline

- GitHub Actions CI workflow
- Dockerfile and local compose baseline
- ADR, architecture, setup, deployment, API, product, and security docs

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

## Package Manager

This repo is intentionally pinned to `pnpm`.

- Use `corepack pnpm install`
- Do not use `npm install`
- If `npm` was run in this repo already, remove `node_modules` and reinstall with `corepack pnpm install`

## Environment Setup

Copy the example file:

```bash
cp .env.example .env.local
```

Recommended `.env.local` starting point:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Important behavior on this branch:

- the marketing and route shell can still boot locally without Supabase env values
- when those values are missing, proxy-based session refresh is skipped in local development
- auth, onboarding, and protected dashboard flows require valid Supabase configuration
- production still requires valid env configuration

## Database Status

This branch now includes the first real schema migration and seed flow under [`supabase/`](./supabase). The database is still early, but it is no longer only scaffolding.

Current schema scope:

- `profiles`
- `organizations`
- `organization_members`
- `locations`
- `incidents`
- `incident_timeline_events`
- `jobs`
- `job_timeline_events`
- `tasks`
- `task_timeline_events`
- `location_member_access`
- `organization_reference_counters`
- `record_comments`
- `record_comment_mentions`
- `record_watchers`
- `record_notifications`

This is the first real operational schema slice, not yet the full long-term PulseOps domain model.

## Quality Bar On This Branch

This branch is meant to demonstrate that the project foundation is:

- typed
- linted
- tested
- buildable
- documented
- ready for feature sprints

## Next Likely Steps

- evolve tenancy into the broader PulseOps tenant and branch model
- add invitations and richer role or permission handling
- extend Sprint 4 into realtime delivery and richer notification experiences
- deepen the dashboard with live operations metrics
- connect billing and subscription control paths

## Supporting Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADR 0001](./docs/adr/0001-sprint-0-foundation.md)
