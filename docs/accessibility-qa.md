# Sprint 11 Accessibility QA

## Shared Primitives

- `SkipLink` is mounted in the root layout and targets `#main-content`.
- `FocusBoundary` gives route transitions a stable main-content focus target.
- `LiveAnnouncer` provides polite and assertive regions for future async UI updates.
- `IconButton`, `FormField`, and `DataTableEmptyRow` are available for accessible controls, forms, and table-empty states.

## Manual QA Checklist

- Tab from the browser address bar and confirm the skip link appears.
- Confirm focus moves into main content after route changes without trapping keyboard users.
- Inspect icon-only controls and ensure they have accessible names.
- Confirm form errors are linked with `aria-describedby` before adding new form surfaces.
- Confirm empty tables render semantic rows instead of disappearing table bodies.
- Re-test reduced-motion preferences for animated loading and route transitions.

## Remaining Work

- Sweep all existing forms and icon-only buttons to adopt the new primitives where they provide clearer semantics.
- Add modal/drawer focus-return checks for command palette, notifications, and admin activity drawers.
