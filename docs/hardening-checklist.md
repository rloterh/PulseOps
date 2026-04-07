# Sprint 11 Hardening Checklist

## Security

- Safe server-side errors are used for abuse-prone analytics and AI routes.
- Sensitive analytics and AI APIs are rate-limited by actor and request fingerprint.
- Billing checkout, portal, and subscription renewal server actions are rate-limited.
- Incident create, edit, status, assignment, escalation, and bulk status actions are rate-limited.
- Job and task create, edit, assignment, and status actions now share the same action-level abuse protection.
- Workspace bootstrap is rate-limited and no longer surfaces raw database errors.
- Auth sign-in and sign-up actions are rate-limited by submitted email plus request fingerprint.
- Collaboration comments, watcher controls, saved views, and notification mutations are rate-limited.
- All analytics JSON, CSV, and AI API routes now return safe errors instead of raw database messages.
- Stronger cross-origin and permissions headers are applied at the app edge.
- Sprint 11 security review notes are captured in `docs/security-review.md`.

## Resilience

- Root `loading`, `error`, `global-error`, and `not-found` states use shared system components.
- Analytics loading and error states use shared skeleton and error primitives.
- The root layout includes a skip link, live announcer placeholders, and a focus boundary.
- Shared `IconButton`, `FormField`, and `DataTableEmptyRow` primitives are available for adoption in follow-up UI sweeps.
- Analytics and task tables have semantic empty rows instead of empty `<tbody>` output.

## Performance

- Lightweight performance mark helpers and lazy-hydration decision helpers are available for future heavy UI reviews.
- Accessibility and performance QA docs now capture the manual review path for final Sprint 11 sign-off.

## Verification

- Security utility coverage exists for rate limiting, upload policy, and request fingerprinting.
- Shared accessibility primitives are documented for manual QA; component-level Vitest coverage needs React transform support before it can be added cleanly.
- Performance utility coverage exists for lazy-hydration decisions and metric naming.
- `corepack pnpm check` should stay green after each Sprint 11 slice.

## Remaining Sprint 11 sweeps

- Extend upload policy adoption once a production upload endpoint exists.
- Continue sweeping form-heavy and icon-only controls to adopt the new accessibility primitives where they improve semantics.
- Run the broader accessibility and bundle review pass against a browser build.
