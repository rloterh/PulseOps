# Sprint 11 Security Review

## Current Coverage

- API routes for analytics exports, analytics JSON, and AI feedback now return safe user-facing errors and log internal failures server-side.
- Server actions for auth, onboarding, billing, incident, job, task, collaboration, saved-view, and notification mutations use shared action-level rate limiting.
- Security headers are centralized through the Next configuration and the shared header helper.
- Upload validation exists as a reusable policy for future endpoints; no production upload route is currently present in the app.

## Authorization Posture

- Tenant and branch checks remain server-owned through the existing repository and action layers.
- UI entitlement gates are paired with server-side billing entitlement reads where Sprint 6 introduced premium surfaces.
- Audit-sensitive operations write through the existing audit and notification foundations where those foundations already exist.

## Review Notes

- Do not trust client-provided role, organization, branch, or entitlement state in new server actions.
- Keep export, AI, billing, and notification routes on the safe-error and rate-limit path when adding endpoints.
- Keep onboarding and workspace bootstrap errors generic unless they are safe, user-actionable validation messages such as duplicate slugs.
- Apply the shared upload policy before introducing any file storage route.
- Prefer route-specific schemas for filters, dates, ids, and enum values before calling repositories.

## Remaining External Validation

- Run a browser QA pass for keyboard navigation, dialogs, focus recovery, and reduced-motion behavior.
- Review production hosting headers after the final deployment target is known.
- Re-tune rate limits after real staging traffic and Stripe/AI/webhook traffic patterns are available.
