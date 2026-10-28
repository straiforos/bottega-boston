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

```sh
bun install
bun run dev
```

Useful scripts:

```sh
bun run test
bun run typecheck
bun run quality
bun run db:migrate:local
```

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
