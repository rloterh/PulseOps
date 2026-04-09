# Deployment

## Cloudflare Workers

PulseOps is now wired for Cloudflare Workers deployment through `@opennextjs/cloudflare`.

### Why the earlier deploy failed

The failing command was:

```bash
npx wrangler deploy
```

run from the monorepo root. Wrangler cannot auto-detect a Next.js Worker project from the root of this workspace. The Worker configuration now lives in `apps/web`, and the repo root exposes wrapper scripts so Cloudflare can still install dependencies once at the workspace root and deploy the correct app.

### Cloudflare Build Settings

Use the repository root as the build root, then configure:

- Install command:

```bash
corepack pnpm install --frozen-lockfile
```

- Build command:

```bash
corepack pnpm cf:build
```

- Deploy command:

```bash
corepack pnpm cf:deploy
```

Do not use `npm run build` plus `npx wrangler deploy` at the workspace root.

Cloudflare connected builds also expect the Worker name in [`apps/web/wrangler.jsonc`](../../apps/web/wrangler.jsonc) to match the actual Worker project name. In this repo that name is `pulseops`, and the `WORKER_SELF_REFERENCE` binding must point to the same value.

### Required Environment Variables

Set these in Cloudflare Workers for both preview and production as appropriate:

```env
NEXT_PUBLIC_APP_URL=https://your-real-domain
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_BUSINESS_MONTHLY=
AI_PROVIDER=deterministic
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
```

Secrets:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`

Production callback and webhook expectations:

- app base URL must be the real public domain in `NEXT_PUBLIC_APP_URL`
- Supabase auth callback route is `/callback`
- Stripe webhook route is `/api/stripe/webhooks`
- Stripe checkout and billing portal return URLs derive from `NEXT_PUBLIC_APP_URL`

### Local Cloudflare Preview

For local Workers-runtime preview:

```bash
corepack pnpm cf:preview
```

The app-local `.dev.vars` file sets `NEXTJS_ENV=development` so OpenNext loads development-flavored Next.js env files during preview.

### Windows Note

OpenNext's Cloudflare build path currently relies on symlink-heavy bundling and is much more reliable on Linux or WSL than on native Windows. In this repo, the Cloudflare build now reaches the OpenNext bundling phase successfully, but native Windows can still fail with `EPERM` during symlink creation. Cloudflare's Linux build environment does not share that limitation.

### Optional Type Generation

If you add Cloudflare bindings later, generate local Worker env typings with:

```bash
corepack pnpm cf:typegen
```

### Current Cloudflare Files

- Worker config: [`apps/web/wrangler.jsonc`](../../apps/web/wrangler.jsonc)
- OpenNext config: [`apps/web/open-next.config.ts`](../../apps/web/open-next.config.ts)
- Local preview vars: [`apps/web/.dev.vars`](../../apps/web/.dev.vars)
- Static asset cache headers: [`apps/web/public/_headers`](../../apps/web/public/_headers)
