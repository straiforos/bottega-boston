<p align="center">
  <img src="src/design-system/bottega-f5161c/bottega/assets/logos/bottega-wordmark.png" alt="Bottega" width="280" />
</p>

# Bottega Boston

The public site for [Bottega](https://bottega.boston): menu, locations, Pasta Club, events, catering, and staff-only editing.

## Stack

- **App** — TanStack Start + React 19 on Cloudflare Workers
- **Data** — Cloudflare D1 (SQLite) via Drizzle
- **Media** — Cloudflare R2 (presigned browser uploads)
- **Mail** — Resend (webhooks + scheduled sends)
- **Auth** — Google OAuth for allowlisted staff
- **Infra** — OpenTofu for D1 / R2 / custom domain; GitHub Actions deploys on `main`

## Develop

### One-time setup

1. Copy the Worker block from [`.env.example`](.env.example) into `.dev.vars`. Set `SITE_ORIGIN=http://localhost:8080` for local OAuth and email links. Optionally copy the Vite Maps keys into `.env`.
2. Install and seed local D1 + media:

```sh
bun install
bun run setup:local
```

`setup:local` applies D1 migrations and downloads every `/media/...` key the repo references into `export/local-media` (gitignored), then puts those objects into Miniflare R2 for `vite preview`.

Or open the repo in a **Dev Container** (`.devcontainer/`). `postCreateCommand` runs `bun install && bun run setup:local`. Still create `.dev.vars` yourself — secrets are not baked into the image.

### Day to day

```sh
bun run dev
```

Open http://localhost:8080. Vite serves `/media/*` from `export/local-media` first; Miniflare still backs D1 and the Worker for everything else. If Miniflare dies on `_cf_ALARM`, run `bun run runtime:reset:local` and retry.

Useful scripts:

```sh
bun run test
bun run typecheck
bun run quality
bun run db:migrate:local
bun run media:seed:local
bun run runtime:reset:local   # if Miniflare dies on _cf_ALARM
```

### Staff tooling notes

- Google OAuth: add `http://localhost:8080/api/auth/callback` in the Google Cloud console; keep your email in the staff allowlist seed.
- Maps / Turnstile: allow `localhost:8080` (and preview origin) on the browser key / widget hostnames.
- Staff media **uploads** still need real Cloudflare `S3_*` credentials in `.dev.vars`. Guest browse works offline after `media:seed:local`.

## Deploy

Push to `main` on this repo. The workflow provisions Cloudflare resources (OpenTofu), applies D1 migrations, and deploys the Worker.

Local one-shot (after secrets and `infra/cloudflare` are configured):

```sh
bun run build
bunx wrangler deploy
```

See [`infra/cloudflare/README.md`](infra/cloudflare/README.md) for OpenTofu details.

## Design system

UI comes from the Bottega library under `src/design-system/bottega-f5161c` (wordmark and mark above). Prefer composing those components over inventing new ones.
