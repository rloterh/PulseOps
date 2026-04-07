# Sprint 11 Hardening Checklist

## Security

- Safe server-side errors are used for abuse-prone analytics and AI routes.
- Sensitive analytics and AI APIs are rate-limited by actor and request fingerprint.
- Billing checkout, portal, and subscription renewal server actions are rate-limited.
- Incident create, edit, status, assignment, escalation, and bulk status actions are rate-limited.
- Job and task assignment/status actions now share the same action-level abuse protection.
- Stronger cross-origin and permissions headers are applied at the app edge.

## Resilience

- Root `loading`, `error`, `global-error`, and `not-found` states use shared system components.
- Analytics loading and error states use shared skeleton and error primitives.
- The root layout includes a skip link, live announcer placeholders, and a focus boundary.

## Verification

- Security utility coverage exists for rate limiting, upload policy, and request fingerprinting.
- `corepack pnpm check` should stay green after each Sprint 11 slice.

## Remaining Sprint 11 sweeps

- Extend rate limiting and safe errors to uploads, admin mutations, and any remaining form-heavy public surfaces.
- Add shared form, icon-button, table-empty, and performance utilities.
- Run the broader accessibility and bundle review pass.
