# Local Development

## Prerequisites

- Node.js 22 or newer
- Corepack enabled

## Bootstrapping

1. Run `corepack pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Add real Supabase values to `.env.local` when you need auth or session-backed flows.
4. Start the app with `corepack pnpm dev`.

## Verification

Run `corepack pnpm check` to execute linting, type-checking, tests, and builds across the workspace.

## Package Manager Note

This repository is intentionally pinned to `pnpm`.

- Use `corepack pnpm install`
- Do not use `npm install`
- If `npm` was run against an existing pnpm-managed `node_modules`, delete `node_modules` and reinstall with `corepack pnpm install`

## Environment Note

During Sprint 0, the app shell can run without Supabase env vars in local development. In that case, proxy-based session refresh is skipped until you add real values to `.env.local`.
