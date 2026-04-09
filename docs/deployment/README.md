# Deployment

## Primary Target: Vercel

PulseOps is a Next.js App Router monorepo, and Vercel is now the primary recommended deployment target for `apps/web`.

Official Vercel monorepo guidance:
- https://vercel.com/docs/monorepos
- https://vercel.com/docs/frameworks/nextjs

### Vercel Project Setup

Create a single Vercel project for the web app and point it at:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`

In most cases you can leave the install and build commands at Vercel defaults.

If you want to set them explicitly, use:

- Install Command:

```bash
pnpm install --frozen-lockfile
```

- Build Command:

```bash
next build
```

- Output Directory:

```text
.next
```

Do not point Vercel at the monorepo root as the app root for this project. The deployable app is `apps/web`.

### Required Environment Variables

Set these in Vercel for Preview and Production as appropriate:

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
- if `NEXT_PUBLIC_APP_URL` includes a trailing slash, app code must normalize it before appending routes
- Supabase Auth must allow the exact confirmation redirect origin and callback URL you send from the app

### Post-Deploy Configuration

After the first successful Vercel deploy:

1. Add the deployed domain to Supabase site URL and redirect configuration.
   Use the same normalized URL shape the app sends, for example:

```text
Site URL: https://pulseops.app
Additional Redirect URLs:
- https://pulseops.app/callback
- https://pulseops-ruby.vercel.app/callback
```

2. Add the Stripe production webhook endpoint:

```text
https://your-real-domain/api/stripe/webhooks
```

3. Set `STRIPE_WEBHOOK_SECRET` from that production webhook endpoint.
4. Verify:
   - `/`
   - `/pricing`
   - `/sign-in`
   - `/callback`
   - `/api/health`

### Cloudflare Note

Cloudflare Workers support was explored for this branch, but the built Worker exceeded Cloudflare's deploy-size limits for the current app bundle. If Cloudflare becomes a target again later, it should be treated as a separate deployment track rather than the default hosting path.
