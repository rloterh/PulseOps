# PulseOps Screenshot Shotlist

Capture screenshots against seeded local demo data. Use a clean browser window, hide local secrets, and keep desktop captures around 1440 px wide unless a mobile shot is requested.

## 01 - Landing Page

- Account: none
- Route: `/`
- Purpose: introduce the product and visual direction
- Notes: capture above-the-fold value proposition and primary CTA

## 02 - Dashboard Overview

- Account: `owner@pulseops-demo.com`
- Route: `/dashboard`
- Purpose: show the operational command center
- Notes: make sure branch and recent activity data are populated

## 03 - Branch Comparison

- Account: `owner@pulseops-demo.com`
- Route: `/analytics/branches`
- Purpose: show multi-location analytics depth
- Notes: use all branches and a 30 or 90 day window

## 04 - Job List Filters

- Account: `manager.toronto@pulseops-demo.com`
- Route: `/jobs`
- Purpose: show list productivity, filters, saved views, and bulk workflow readiness
- Notes: use a non-empty filter result

## 05 - Job Detail

- Account: `operator.toronto@pulseops-demo.com`
- Route: `/jobs/[jobId]`
- Purpose: show assignments, status, timeline, and operational detail
- Notes: choose a job with due date and activity history

## 06 - Incident Center

- Account: `admin@pulseops-demo.com`
- Route: `/incidents`
- Purpose: show incident triage and escalation readiness
- Notes: include mixed severities and statuses

## 07 - Audit Logs

- Account: `owner@pulseops-demo.com`
- Route: `/admin/activity`
- Purpose: show enterprise auditability
- Notes: select one row so the metadata drawer is visible

## 08 - Billing State

- Account: `finance@pulseops-demo.com`
- Route: `/billing`
- Purpose: show Stripe and entitlement integration
- Notes: use active or trialing subscription state

## 09 - AI Summary

- Account: `owner@pulseops-demo.com`
- Route: `/analytics`
- Purpose: show executive summary, risk signals, and explanation UI
- Notes: open one explanation sheet if possible

## 10 - Mobile Dashboard

- Account: `manager.toronto@pulseops-demo.com`
- Route: `/dashboard`
- Purpose: show responsive polish
- Notes: use a mobile viewport and avoid developer overlays
