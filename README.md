# PulseOps

PulseOps is an operations command center for multi-location service businesses. The `setup` branch is the Sprint 0 foundation branch: it focuses on architecture, tooling, workspace boundaries, developer experience, and app scaffolding rather than finished product modules.

This branch is meant to show how the project is being built, not pretend the full product is already complete.

## Branch Status

Current branch: `setup`

What this branch delivers:

- a `pnpm` workspace and Turborepo foundation
- a Next.js 16 App Router web app scaffold
- shared TypeScript, ESLint, and Prettier config packages
- typed environment validation with Zod
- Supabase client boundaries for browser, server, admin, and edge session refresh
- a Tailwind v4 design-token baseline and minimal UI primitives
- CI, Docker, docs, and verification tooling
- placeholder marketing, auth, dashboard, and portal routes aligned to the PulseOps domain model

What this branch does not claim yet:

- production auth flows
- real tenant onboarding
- implemented jobs, branches, incidents, analytics, billing, or customer workflows
- completed database schema migrations and RLS policies
- Stripe integration
- AI features beyond structural preparation

## Why This Branch Exists

PulseOps is intended to become a premium B2B SaaS platform, so the first branch establishes the standards that later feature sprints will build on:

- domain-first structure instead of dumping logic into route files
- server-aware environment boundaries
- explicit Supabase runtime separation
- repeatable CI and local development workflows
- a professional base for future auth, tenancy, billing, and analytics work

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
- Stable placeholder routes for:
  - `/`
  - `/pricing`
  - `/docs`
  - `/contact`
  - `/sign-in`
  - `/sign-up`
  - `/verify`
  - `/dashboard`
  - `/jobs`
  - `/branches`
  - `/incidents`
  - `/analytics`
  - `/billing`
  - `/customers`
  - `/settings`
  - `/portal`
- Global layout, loading state, error boundary, not-found screen, and health endpoint

### Shared Infrastructure

- Zod-validated env access in `packages/env`
- Supabase client factories in `packages/supabase`
- Proxy-based session refresh scaffold in the web app
- Security headers baseline
- Lightweight logging helper

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

- the app can boot locally without Supabase env values during Sprint 0
- when those values are missing, proxy-based session refresh is skipped in local development
- production still requires valid env configuration

## Database Status

The repo already includes Supabase scaffolding under [`supabase/`](./supabase), but this branch does not yet include the real PulseOps schema migrations. That means the database workflow is prepared, but the product schema still needs to be implemented in follow-up work.

## Quality Bar On This Branch

This branch is meant to demonstrate that the project foundation is:

- typed
- linted
- tested
- buildable
- documented
- ready for feature sprints

## Next Likely Steps

- implement the initial PulseOps schema migrations
- add auth and tenant onboarding
- introduce request-context authorization helpers
- build the authenticated app shell from placeholder to functional shell
- begin the jobs and branch domains on top of the established workspace boundaries

## Supporting Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADR 0001](./docs/adr/0001-sprint-0-foundation.md)
