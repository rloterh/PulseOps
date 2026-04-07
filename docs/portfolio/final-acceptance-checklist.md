# Sprint 12 Final Acceptance Checklist

Use this checklist before publishing the repository, recording the walkthrough, or sending PulseOps as a portfolio sample.

## Local Demo Readiness

- [ ] `corepack pnpm install` completes with pnpm.
- [ ] `.env.local` contains local Supabase values.
- [ ] `corepack pnpm exec supabase start` starts the local stack.
- [ ] `corepack pnpm exec supabase db reset` applies the schema cleanly.
- [ ] `corepack pnpm seed:demo` creates the Northstar Facility Services tenant.
- [ ] `owner@pulseops-demo.com` can sign in with the documented demo password.
- [ ] `/dashboard`, `/jobs`, `/incidents`, `/analytics`, `/billing`, and `/admin/activity` show populated data.

## Portfolio Assets

- [ ] Architecture Mermaid files render correctly.
- [ ] `docs/portfolio/demo-guide.md` matches the current demo flow.
- [ ] `docs/product/demo-personas.md` matches seeded accounts.
- [ ] `docs/portfolio/screenshot-shotlist.md` covers all required screenshots.
- [ ] `docs/portfolio/walkthrough-script.md` can be recorded in one pass.
- [ ] `docs/portfolio/case-study.md` is ready for a portfolio page or PDF adaptation.
- [ ] Final screenshots are captured into `apps/web/public/screenshots` when ready.

## Quality Gate

- [ ] `corepack pnpm check` passes.
- [ ] Public README links resolve.
- [ ] No production secrets are committed.
- [ ] Stripe and external AI limitations are described honestly.
- [ ] Demo-only credentials are clearly scoped to local/reviewer environments.
