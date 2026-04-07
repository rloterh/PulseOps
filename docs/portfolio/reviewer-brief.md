# PulseOps Reviewer Brief

PulseOps is an AI-powered operations command center for multi-location service businesses. It brings jobs, incidents, branch analytics, SLA visibility, auditability, billing state, and explainable executive summaries into one enterprise-style SaaS experience.

## Best Review Path

1. Read the README overview and architecture section.
2. Run the local demo seed with `corepack pnpm seed:demo`.
3. Sign in as `owner@pulseops-demo.com`.
4. Visit `/dashboard`, `/analytics/branches`, `/jobs`, `/incidents`, `/billing`, `/admin/activity`, and `/analytics`.
5. Skim the case study and walkthrough script to understand the product and engineering story.

## What To Look For

- Multi-tenant and branch-aware workflows.
- Operational modeling beyond basic CRUD.
- Server-side entitlement, rate-limit, and safe-error boundaries.
- Stripe billing state integrated into product permissions.
- Incidents, audit logs, timelines, and SLA context.
- Analytics and AI summaries grounded in operational data.
- Portfolio packaging that makes the project reviewable without private context.

## Honest Constraints

- Demo AI defaults to deterministic generation so reviewers do not need an external LLM key.
- Stripe flows require real Stripe env vars for live checkout and portal QA.
- Screenshot and walkthrough media are captured after seeding the local demo tenant.
