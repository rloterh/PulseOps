# PulseOps Architecture

PulseOps is a modular monolith inside a pnpm workspace. The web app owns routing, server actions, route handlers, and feature modules, while shared packages own environment parsing, Supabase clients, UI foundations, and framework-agnostic helpers.

## Runtime Boundaries

- Client components handle shell interactivity, list preferences, drawers, command palette state, and immediate UI feedback.
- Server components load tenant-scoped data and keep route files thin by calling feature-owned queries.
- Server actions handle authenticated mutations such as job status changes, incident escalation, billing controls, saved views, comments, and notifications.
- Route handlers support API-style surfaces such as Stripe webhooks, analytics exports, AI feedback, and directory lookups.

## Data And Tenancy

Supabase Postgres is the source of truth for organizations, locations, users, jobs, incidents, tasks, billing state, audit logs, analytics inputs, and AI run metadata. Server-side repository and action layers derive the authenticated user, tenant, role, and branch context before reading or mutating protected data.

## Billing

Stripe owns checkout, subscription lifecycle, and the billing portal. PulseOps persists Stripe customer, subscription, entitlement, and webhook event state so app routes can make server-side gating decisions without trusting client state.

## AI Layer

The AI layer is intentionally explainable and data-adjacent. It generates deterministic executive summaries, branch synthesis, late-job risk signals, and explanation metadata from analytics inputs. AI runs and feedback are persisted for traceability, but operational records remain the business source of truth.

## Hardening

Sprint 11 adds shared safe-error handling, rate limiting, request fingerprints, upload policy helpers, accessibility primitives, error/loading states, and performance review helpers. These utilities are designed to make future endpoints safer without forcing route-by-route rewrites.

## Diagram Sources

- [System architecture](./pulseops-architecture.mmd)
- [Data flow](./pulseops-data-flow.mmd)
- [Deployment](./pulseops-deployment.mmd)
