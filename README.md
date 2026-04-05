# PulseOps

PulseOps is an AI-powered operations command center for multi-location service businesses. This repository is set up as a production-minded monorepo with a Next.js app, shared workspace packages, Supabase integration boundaries, CI, Docker, and documentation scaffolding ready for feature sprints.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript strict mode
- Tailwind CSS v4
- Supabase for auth, database, storage, and realtime
- Stripe-ready billing architecture
- Turborepo and pnpm workspaces
- Vitest and Testing Library
- GitHub Actions CI
- Docker for local parity

## Workspace Layout

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

## Sprint 0 Focus

- Establish shared package boundaries and tooling standards
- Scaffold the App Router structure for marketing, auth, dashboard, and portal surfaces
- Add typed environment parsing with safe server and client entry points
- Isolate Supabase browser, server, admin, and edge session-refresh clients
- Introduce design tokens, primitive UI components, and placeholder routes aligned to PulseOps domains
- Add CI, Docker, and documentation baselines before business logic lands

## Getting Started

1. Run `corepack pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Run `corepack pnpm dev`.
4. Verify the workspace with `corepack pnpm check`.

## Docs

- [Architecture](./docs/architecture/README.md)
- [API](./docs/api/README.md)
- [Security](./docs/security/README.md)
- [Setup](./docs/setup/local-development.md)
- [Deployment](./docs/deployment/README.md)
- [ADRs](./docs/adr/0001-sprint-0-foundation.md)
