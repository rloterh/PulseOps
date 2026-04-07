# PulseOps Case Study

## Overview

PulseOps is a portfolio-grade SaaS platform for multi-location service businesses that need centralized operational visibility. It combines job dispatch, branch monitoring, SLA health, incident escalation, audit logging, billing state, and AI-assisted executive summaries into a single command center.

## Problem

Service businesses often coordinate work across branches, dispatch teams, field operators, managers, and finance stakeholders. When job updates, incidents, billing state, and performance metrics live in separate tools, leadership loses the ability to see risk early and operators lose context.

## Users And Roles

PulseOps models organization owners, admins, managers, operators, and finance-focused users. The product demonstrates how different roles can share one operational workspace while still relying on server-side tenancy, branch, role, and entitlement checks.

## Product Strategy

The roadmap intentionally moves from foundation to operations, collaboration, billing, auditability, analytics, AI, hardening, and final portfolio packaging. Each sprint adds a layer that supports the next one instead of creating disconnected demos.

## Key Features

- Multi-branch dashboard and branch-aware navigation
- Jobs, incidents, and tasks with status, assignment, timeline, and SLA context
- Collaboration, watchers, notifications, and inbox triage
- Saved views, list preferences, sortable tables, and bulk workflows
- Stripe billing, portal handoff, webhooks, subscription state, and entitlements
- Incident escalation, audit logs, and admin activity review
- Analytics overview, branch comparison, SLA metrics, CSV exports, and AI summaries
- Marketing, docs, help center, and SEO-focused public content
- Security, accessibility, error-state, and performance hardening foundations

## Technical Architecture

PulseOps uses Next.js App Router, React, TypeScript, Tailwind CSS, Zustand, Supabase, Stripe, and a deterministic AI insight layer. Feature modules keep business logic away from page components, shared packages keep environment and Supabase access explicit, and route handlers/server actions are the control points for protected workflows.

## Security And Hardening

The implementation emphasizes server-side authorization, safe errors, rate limiting, audit logging, structured docs, upload policy guidance, accessible UI primitives, and production-oriented validation. Sprint 11 keeps hardening separate from product scope so the app can become more reliable without changing the core direction.

## AI Design Philosophy

AI in PulseOps explains operational risk rather than replacing operational truth. Summaries and branch insights are generated from analytics and SLA signals, persisted as AI runs, and paired with explanation UI plus feedback metadata.

## UX And Interface Decisions

The product uses a focused command-center aesthetic with dense but readable operational surfaces. Tables, filters, panels, drawers, and summary cards are designed to help operators move quickly while still preserving context for managers and reviewers.

## Tradeoffs And Constraints

- The demo AI layer is deterministic by default to avoid requiring external provider credentials.
- Upload hardening is implemented as a policy foundation because the current product does not ship a production upload endpoint.
- Live Stripe and browser QA remain deployment-stage validation tasks because local checks cannot fully prove third-party flows.

## What I Would Improve Next

- Add a durable distributed rate-limit store for multi-instance production deployments.
- Add screenshot automation once seeded demo data is finalized.
- Add optional hosted AI provider execution behind the existing AI run abstraction.
- Expand browser-level accessibility and performance reporting in CI.

## Outcome And Portfolio Value

PulseOps demonstrates senior-level full-stack execution across product modeling, multi-tenant data design, operational workflows, billing, analytics, explainable AI, auditability, hardening, and polished portfolio presentation.
