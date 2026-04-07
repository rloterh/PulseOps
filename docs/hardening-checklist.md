# Sprint 11 Hardening Checklist

## Security

- Safe server-side errors are used for abuse-prone analytics and AI routes.
- Sensitive analytics and AI APIs are rate-limited by actor and request fingerprint.
- Stronger cross-origin and permissions headers are applied at the app edge.

## Resilience

- Root `loading`, `error`, `global-error`, and `not-found` states use shared system components.
- Analytics loading and error states use shared skeleton and error primitives.
- The root layout includes a skip link, live announcer placeholders, and a focus boundary.

## Verification

- Security utility coverage exists for rate limiting, upload policy, and request fingerprinting.
- `corepack pnpm check` should stay green after each Sprint 11 slice.

## Remaining Sprint 11 sweeps

- Extend rate limiting and safe errors to uploads, billing, incident writes, and admin mutations.
- Add shared form, icon-button, table-empty, and performance utilities.
- Run the broader accessibility and bundle review pass.
