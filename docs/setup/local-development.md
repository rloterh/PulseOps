# Local Development

## Prerequisites

- Node.js 22 or newer
- Corepack enabled

## Bootstrapping

1. Run `corepack pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Start local Supabase with `corepack pnpm exec supabase start`.
4. Apply the current Sprint 1 schema with `corepack pnpm exec supabase db reset`.
5. Add the local Supabase values to `.env.local`.
6. Start the app with `corepack pnpm dev`.

The `db reset` step applies both the base Sprint 1 schema and the follow-up hardening migration, including the retry-safe workspace bootstrap RPC.

## Verification

Run `corepack pnpm check` to execute linting, type-checking, tests, and builds across the workspace.

## Package Manager Note

This repository is intentionally pinned to `pnpm`.

- Use `corepack pnpm install`
- Do not use `npm install`
- If `npm` was run against an existing pnpm-managed `node_modules`, delete `node_modules` and reinstall with `corepack pnpm install`

## Environment Note

The marketing shell can still run without Supabase env vars in local development. In that case, proxy-based session refresh is skipped until you add real values to `.env.local`.

Sprint 1 auth, onboarding, and protected dashboard flows require these values:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Sprint 2 builds on that foundation with a richer protected shell, so it is worth validating these browser flows locally after setup:

- sign in and sign out
- onboarding redirect behavior
- dashboard, team, inbox, and branch navigation
- command palette with `Ctrl+K`
