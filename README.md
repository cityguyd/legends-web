# Legends Library — Web

Next.js (App Router) front end for Legends Library. Talks to the FastAPI
engine (sibling `legends-library` repo) for chat, and to Supabase for auth,
profiles, and saved conversations. Stripe powers the Premium subscription.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

Run the engine separately (defaults to `http://localhost:8000`) so chat works
end to end, or rely on the E2E mock engine for the funnel tests.

## Tests

- `npm test` — Vitest unit/component tests (`tests/`).
- `npm run e2e` — Playwright funnel tests (`e2e/`). First time:
  `npx playwright install chromium`. The Playwright config boots the dev server
  with `E2E_MOCK_DATA=1` (data-layer fixture seam in `lib/marketing/data.ts`)
  and a dependency-free mock engine (`e2e/mock-engine.mjs`) — no database or
  real engine required.

## Environment variables

All web env vars live in `.env.example`. Copy it to `.env.local` for local dev
and set the same keys in the Vercel project (see below).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public). |
| `NEXT_PUBLIC_ENGINE_URL` | Base URL of the FastAPI engine (e.g. the Railway URL). |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server only, used by the Stripe webhook to write `profiles.tier`. |
| `STRIPE_SECRET_KEY` | Stripe secret key (server only). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `/api/stripe/webhook` endpoint. |
| `STRIPE_PRICE_ID` | Price ID for the $7/mo Premium plan. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (used for Stripe redirect URLs). |

## Deploy — Vercel (web app)

1. Import the `legends-web` repo into Vercel (framework auto-detected as
   Next.js — no `vercel.json` needed; defaults are correct).
2. Add every variable from the table above as a Vercel **Environment Variable**
   (Production + Preview). The `NEXT_PUBLIC_*` ones are exposed to the browser;
   the rest are server-only.
3. Point `NEXT_PUBLIC_ENGINE_URL` at the deployed Railway engine URL and
   `NEXT_PUBLIC_SITE_URL` at the Vercel production domain.

## Deploy — Railway (FastAPI engine)

Config lives in `legends-library/railway.toml` (nixpacks builder,
`uvicorn legends.api:app`, healthcheck `/api/usage`).

Railway environment variables — the engine's existing vars (see
`legends-library/.env.example`) plus the two web-integration vars:

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude (chat + classifier). |
| `OPENAI_API_KEY` | Embeddings + moderation. |
| `PINECONE_API_KEY`, `PINECONE_INDEX` | Vector DB. |
| `SUPABASE_URL`, `SUPABASE_KEY` | Supabase (service_role key). |
| `ADMIN_TOKEN` | Protects `/api/ingest`. |
| `SUPABASE_JWT_SECRET` | Verifies Supabase-issued JWTs on `/api/chat` and `/api/usage` so signed-in callers get their tier/limits. |
| `CORS_ORIGINS` | Comma-separated allowed origins — set to the Vercel domain(s) so the browser can call the engine cross-origin. |

## Stripe dashboard setup

1. **Product / price** — create a recurring product "Legends Library Premium"
   with a **$7/month** price. Copy its price ID into `STRIPE_PRICE_ID`.
2. **Webhook endpoint** — add an endpoint pointing at
   `https://<your-vercel-domain>/api/stripe/webhook` subscribed to:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.

## Supabase Auth provider setup

Enable the OAuth providers under **Authentication → Providers** and register
the redirect URLs (production + local):

- **Google** — redirect URL
  `https://<project-ref>.supabase.co/auth/v1/callback`; add
  `https://<your-vercel-domain>/auth/callback` (and
  `http://localhost:3000/auth/callback` for local) to the allowed redirect URLs.
- **Apple** — same callback URL pattern; configure the Apple Service ID, team
  ID, key ID, and private key in the Supabase Apple provider settings.
