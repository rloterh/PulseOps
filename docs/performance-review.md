# Sprint 11 Performance Review

## Shared Utilities

- `createPerformanceMarkName`, `markPerformance`, and `measurePerformance` provide tiny wrappers for manual instrumentation.
- `shouldPreferLazyHydration` documents the threshold for moving non-critical UI behind lazy boundaries.

## Review Targets

- Analytics charts, AI explanation surfaces, and admin activity drawers should stay under review because they are visually rich and interaction-heavy.
- Public marketing pages should be checked with Lighthouse after final content review.
- Any future heavy client-only component should justify eager loading if it is above the fold and immediately interactive.

## Manual QA Checklist

- Run the production build and inspect route chunk output.
- Exercise `/analytics`, `/analytics/branches`, `/analytics/sla`, `/admin/activity`, and `/billing`.
- Confirm no non-critical analytics/admin UI blocks first paint unnecessarily.
- Record any chunk that looks unexpectedly large and trace it to a specific component or dependency.

## Remaining Work

- Run a browser-level Lighthouse pass after Sprint 11 is otherwise complete.
- Decide whether a bundle analyzer dependency is worth adding once production hosting and CI constraints are final.
