# Architecture Overview

PulseOps is structured as a modular monolith inside a pnpm workspace:

- `apps/web` hosts the Next.js 16 App Router application.
- `packages/env` owns environment parsing and keeps client and server entry points explicit.
- `packages/supabase` centralizes browser, server, edge refresh, and admin client creation.
- `packages/ui` contains design tokens and shared primitives.
- `packages/utils` contains framework-agnostic helpers.

Key Sprint 0 decisions:

- Business domains will live under `apps/web/src/features`.
- Route files stay thin and compose feature-owned logic.
- Shared packages are transpiled explicitly in Next to keep imports stable.
- Security headers, tests, CI, and Docker exist before business modules land.

## Sprint 12 Portfolio Diagrams

- [PulseOps Architecture](./pulseops-architecture.md)
- [System architecture diagram](./pulseops-architecture.mmd)
- [Data flow diagram](./pulseops-data-flow.mmd)
- [Deployment diagram](./pulseops-deployment.mmd)
