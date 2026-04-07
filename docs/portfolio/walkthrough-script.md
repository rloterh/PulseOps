# PulseOps Walkthrough Script

Target length: 4 to 7 minutes.

## Timestamp Template

- 00:00 - Intro and product framing
- 00:30 - Problem and audience
- 01:00 - Dashboard and branch context
- 01:45 - Job operations workflow
- 02:45 - Incident management and SLA escalation
- 03:45 - Analytics and AI explanation
- 04:45 - Billing and entitlements
- 05:30 - Audit, security, and hardening
- 06:15 - Closing and portfolio positioning

## 1. Intro

- Route: `/`
- Account: none
- Say: "PulseOps is an AI-powered operations command center for multi-location service businesses. It brings dispatch, branch visibility, SLA tracking, incident response, billing, auditability, and executive summaries into one platform."
- Avoid: claiming it is a deployed production company product unless showing a real deployment.

## 2. Problem

- Route: `/`
- Account: none
- Say: "Multi-branch service teams often manage jobs, incidents, escalations, and customer-impact risk across scattered tools. PulseOps focuses on visibility, traceability, and operational follow-through."

## 3. Dashboard And Branch Context

- Route: `/dashboard`
- Account: `owner@pulseops-demo.com`
- Action: show dashboard cards and branch switching.
- Say: "The app is tenant-aware and branch-aware. Server components and actions derive access from the authenticated membership rather than trusting client state."

## 4. Job Operations Workflow

- Route: `/jobs`
- Account: `manager.toronto@pulseops-demo.com`
- Action: filter the job list, open a job, show assignment and timeline.
- Say: "Sprint 5 added productivity details like query-state filters, saved views, row navigation, and bulk workflows."

## 5. Incident Management

- Route: `/incidents`
- Account: `admin@pulseops-demo.com`
- Action: open an incident, show SLA panel and escalation controls.
- Say: "Incidents support escalation, acknowledgement, timeline context, notifications, and audit trail coverage."

## 6. Analytics And AI

- Route: `/analytics`
- Account: `owner@pulseops-demo.com`
- Action: open the executive summary and an explanation sheet.
- Say: "The AI layer is explainable and deterministic by default. It summarizes analytics signals without becoming the operational source of truth."

## 7. Billing And Entitlements

- Route: `/billing`
- Account: `finance@pulseops-demo.com`
- Action: show subscription status and plan controls.
- Say: "Stripe handles checkout and the billing portal, while PulseOps stores subscription and entitlement state for server-side feature gating."

## 8. Security And Hardening

- Route: `/admin/activity`
- Account: `owner@pulseops-demo.com`
- Action: show audit rows and metadata drawer.
- Say: "Sprint 11 added safe error handling, route and action rate limits, accessibility primitives, loading/error states, and performance review docs."

## 9. Closing

- Route: `/docs`
- Account: none
- Say: "PulseOps demonstrates product strategy, multi-tenant architecture, operational data modeling, billing integration, explainable AI, and production-minded hardening in one cohesive portfolio project."

## Caption-Ready Short Narration

PulseOps is an AI-powered operations command center for multi-location service businesses. It centralizes jobs, incidents, branch analytics, SLA visibility, auditability, billing state, and explainable executive summaries in one SaaS-style platform. The demo uses seeded Northstar Facility Services data so reviewers can see realistic branch workflows, escalation pressure, payment state, and AI-assisted risk framing without needing production data.
