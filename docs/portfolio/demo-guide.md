# PulseOps Demo Guide

This guide helps a reviewer run a focused PulseOps demo without needing extra context from the project author.

## Recommended Demo Order

1. Start on the marketing landing page at `/`.
2. Sign in as the owner persona and open `/dashboard`.
3. Show branch context, operational lists, and a job detail page.
4. Open `/incidents` and demonstrate escalation, SLA, and timeline context.
5. Open `/analytics`, `/analytics/branches`, and `/analytics/sla`.
6. Open the AI executive summary and explanation surfaces on `/analytics`.
7. Open `/billing` and explain plan state, entitlement checks, and Stripe handoff.
8. Open `/admin/activity` to show auditability.
9. Close with `/docs` or `/help` to show the public content layer.

## Demo Accounts

The canonical demo accounts are documented in [Demo Personas](../product/demo-personas.md). Use them only for local or reviewer demo environments. Do not publish real production credentials.

## Local Setup

1. Run `corepack pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Start Supabase with `corepack pnpm exec supabase start`.
4. Reset the local database with `corepack pnpm exec supabase db reset`.
5. Run the demo seed flow with `corepack pnpm seed:demo`.
6. Start the app with `corepack pnpm dev`.

The seed flow creates the Northstar Facility Services demo tenant, demo auth users, branch access, operational records, timelines, notifications, audit logs, billing state, SLA snapshots, saved views, and AI run examples. Use `corepack pnpm seed:demo:reset` when you want to remove only the seeded demo tenant and demo accounts.

The default local password is `DemoPass123!`. Override it with `PULSEOPS_DEMO_PASSWORD` in `.env.local` if you need a different reviewer password.

## External Service Fallbacks

- Stripe checkout and portal flows require Stripe environment variables. If they are missing, show the billing UI state and explain the configured fallback behavior.
- The AI layer is deterministic by default, so the analytics AI demo does not require an external LLM key.
- Upload policy is documented for future endpoints; PulseOps does not currently ship a production upload route.

## Reviewer Notes

Use seeded data for screenshots and walkthroughs. Avoid showing empty dashboards unless the goal is to demonstrate resilience states.
