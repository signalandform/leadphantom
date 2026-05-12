# Lead Phantom

Monorepo for **Lead Phantom**, a demo-ready SaaS scaffold that monitors Google Maps-style lead data and syncs exports toward Google Sheets.

## Structure

- `apps/web` — Next.js 14 (App Router) marketing site + dashboard (POC mock mode **by default**, or Supabase-backed when configured)
- `packages/lead-phantom-services` — Typed Google Places / Sheets **stubs** (`normalizePlaceDetails`, `buildSheetRows`, HTTP TODOs)
- `packages/shared` — Thin shared constants (branding)

Postgres tables for this product use an `_lp` suffix (e.g. `profiles_lp`) so they can coexist cleanly in a multitenant database.

## Proof-of-concept mode (default)

By default the app runs in **POC mode** (`NEXT_PUBLIC_POC_MODE` unset or any value except `false`):

- **No Supabase, Docker, or database** required to click through the UI.
- **No auth** — `/dashboard` is open; middleware skips session checks.
- **No HTTP APIs** — `/api/searches/*` returns 404; the dashboard uses **server actions** + an **in-memory mock store** (`apps/web/lib/mock/poc-store.ts`) with the same table shapes as production.
- Stub Places/Sheets logic lives in `@lead-phantom/services` and is reused by both POC and production paths (`apps/web/lib/search/stub-pipeline.ts`, `supabase-search-run.ts`).

Set **`NEXT_PUBLIC_POC_MODE=false`** in `apps/web/.env.local`, add Supabase keys, run migrations, then magic-link auth and persistence paths activate (existing code paths).

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) 9+
- Docker Desktop running locally when using `supabase start` / `supabase db reset`

## Quick start

```bash
pnpm install
cp .env.example apps/web/.env.local   # optional; POC works without Supabase keys
pnpm dev
```

For **production-style** local dev (Supabase + auth), set `NEXT_PUBLIC_POC_MODE=false` in `apps/web/.env.local` and paste keys from `supabase status` after starting Supabase.

### Supabase locally (optional until POC=false)

```bash
supabase start
supabase status   # copy API URL, anon key, service_role key
```

Apply migrations + seed:

```bash
supabase db reset   # runs migrations in supabase/migrations + supabase/seed.sql
```

Generate TypeScript types (optional but recommended):

```bash
supabase gen types typescript --local > apps/web/lib/database.generated.ts
# Merge or replace the hand-maintained subset in apps/web/lib/database.types.ts
```

### Run the web app

From repo root:

```bash
pnpm dev
```

Or use the helper script (starts Supabase when CLI + Docker are available):

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Open [http://localhost:3000](http://localhost:3000).

`apps/web/lib/supabase/env.ts` ships non-empty URL/key fallbacks so `next build` and CI work before secrets exist — replace them via `apps/web/.env.local` for real auth and data.

## Demo credentials (Supabase seed, when `NEXT_PUBLIC_POC_MODE=false`)

After `supabase db reset`, a demo user exists:

- Email: `founder@leadphantom.com`
- Password: `demo-password-change-me`

Magic link (`/signup`) is used when POC mode is off; SMTP must be configured for real email delivery.

## Scripts

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Next.js dev server (`apps/web`)                  |
| `pnpm build`     | Production build                                  |
| `pnpm lint`      | ESLint for packages + `next lint` for `apps/web` |
| `pnpm typecheck` | TypeScript across workspaces                      |
| `pnpm test`      | Vitest (`@lead-phantom/services`)                |

## Security notes / TODOs

- **Secrets**: `profiles_lp.google_api_key` and `api_credentials_lp.encrypted_key` are plaintext placeholders. Swap for Supabase Vault, KMS, or envelope encryption before production.
- **Sheets**: `sheetsAppendRows` is a stub — add OAuth/service account flows and parse spreadsheet IDs from URLs.
- **Queues**: `/api/searches/run` is synchronous (disabled in POC); migrate orchestration to a durable worker with retries.

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs lint, typecheck, and tests on pushes and PRs.
