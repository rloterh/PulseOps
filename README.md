# PulseOps

PulseOps is an operations command center for multi-location service businesses. The `feature/auth-tenancy` branch is the Sprint 1 branch: it turns the Sprint 0 foundation into the first real product slice with authentication, workspace onboarding, database tenancy, and a protected dashboard shell.

This branch is still intentionally early-stage. It demonstrates the working auth and tenancy baseline without pretending the full operations platform is already built.

## Branch Status

Current branch: `feature/auth-tenancy`

What this branch delivers:

- a `pnpm` workspace and Turborepo foundation
- a Next.js 16 App Router web app scaffold
- shared TypeScript, ESLint, and Prettier config packages
- typed environment validation with Zod
- Supabase client boundaries for browser, server, admin, and edge session refresh
- a real Supabase migration for profiles, organizations, memberships, and starter locations
- sign-up, sign-in, callback, verify, sign-out, and first-workspace onboarding flows
- a protected dashboard shell with org-aware overview, branches, and settings surfaces
- a Tailwind v4 design-token baseline and minimal UI primitives
- CI, Docker, docs, and verification tooling
- marketing and dashboard routes aligned to the PulseOps domain model

What this branch does not claim yet:

- implemented jobs, incidents, analytics, billing, or customer workflows
- the final long-term tenant and branch schema for the whole product
- invitation flows, fine-grained permissions, or customer portal auth
- Stripe integration
- AI features beyond structural preparation

## Why This Branch Exists

PulseOps is intended to become a premium B2B SaaS platform, so this branch proves the first vertical slice on top of the earlier foundation:

- real auth and callback handling
- tenant bootstrap with RLS-backed organization membership
- protected routing and onboarding redirects
- org-scoped reads in the dashboard shell
- a professional base for later jobs, branches, incidents, billing, and analytics work

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
  - `/settings`
- Placeholder routes preserved for:
  - `/pricing`
  - `/docs`
  - `/contact`
  - `/jobs`
  - `/incidents`
  - `/analytics`
  - `/billing`
  - `/customers`
  - `/portal`
- Global layout, loading state, error boundary, not-found screen, and health endpoint

### Shared Infrastructure

- Zod-validated env access in `packages/env`
- Supabase client factories in `packages/supabase`
- Proxy-based session refresh and route protection
- Security headers baseline
- Lightweight logging helper

### Database And Tenancy

- Initial migration in `supabase/migrations/20260406_000001_sprint_1_auth_orgs.sql`
- Profile bootstrap trigger from `auth.users`
- `organizations`, `organization_members`, and `locations` tables
- Starter RLS policies for self-profile access, org membership reads, workspace creation, and location access
- Seed data that creates a demo workspace and starter locations when a profile exists

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

This is the Sprint 1 tenancy root, not the final full PulseOps domain model.

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
- begin real jobs and incidents schema work
- deepen the dashboard with live operations metrics
- connect billing and subscription control paths

## Supporting Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADR 0001](./docs/adr/0001-sprint-0-foundation.md)
