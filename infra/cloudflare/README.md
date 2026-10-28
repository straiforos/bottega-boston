# Cloudflare infrastructure (OpenTofu)

Declares account resources the Worker binds to:

- D1 database `bottega`
- R2 bucket `bottega-media`
- Zone setting **Always Use HTTPS** (`always_use_https = on`)
- Workers custom domains `bottega.boston` and `www.bottega.boston` (after the script exists; Worker 301s www → apex)

State is stored in R2 bucket `bottega-tfstate` (S3 backend). The deploy workflow creates that bucket if missing, then applies this stack on every push to `main`.

The Worker script, cron, secrets, and SQL migrations stay in Wrangler / GitHub Actions. CI renders `wrangler.ci.json` with the live D1 id from OpenTofu output so UUIDs never land in git.

## Prerequisites

1. Zone `bottega.boston` already on Cloudflare (nameservers delegated).
2. API token (`CLOUDFLARE_API_TOKEN`) with Account: D1 Edit, Workers R2 Storage Edit, Workers Scripts Edit; Zone: Workers Routes / DNS Edit for that zone.
3. R2 S3 API token in GitHub as `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and account endpoint as `S3_ENDPOINT` (`https://<accountid>.r2.cloudflarestorage.com` — also used by the Worker for presigned uploads).
4. [OpenTofu](https://opentofu.org/) ≥ 1.6 locally if you apply by hand.

## Local apply

```bash
export CLOUDFLARE_API_TOKEN=…
export AWS_ACCESS_KEY_ID=…          # R2 S3 access key
export AWS_SECRET_ACCESS_KEY=…
# Account endpoint only — never https://<bucket>.<account>.r2.cloudflarestorage.com
export AWS_ENDPOINT_URL_S3=https://<accountid>.r2.cloudflarestorage.com

# Once: state bucket
bunx wrangler r2 bucket create bottega-tfstate

cp terraform.tfvars.example terraform.tfvars   # set cloudflare_account_id
tofu init -reconfigure \
  -backend-config="endpoints={s3=\"$AWS_ENDPOINT_URL_S3\"}" \
  -backend-config="use_path_style=true"
# Account resources only (never flip manage_dns=false on a full apply — that
# destroys the Workers custom domain and drops the apex for the whole deploy).
tofu apply -var='manage_dns=false' \
  -target=cloudflare_zone_setting.always_use_https \
  -target=cloudflare_d1_database.bottega \
  -target=cloudflare_r2_bucket.media \
  -target=cloudflare_r2_bucket_cors.media
# After wrangler deploy (idempotent once the domains exist):
node ../../scripts/ensure-workers-apex.mjs
tofu apply -var='manage_dns=true'
```

CI builds that same account endpoint from `CLOUDFLARE_ACCOUNT_ID` (must be the account id from the dashboard URL / R2 Overview, not an R2 access key id). If `tofu init` fails with `tls: handshake failure`, the per-account S3 cert may still be provisioning — confirm with `curl -vI "$AWS_ENDPOINT_URL_S3"` and wait or open a Cloudflare ticket.

## Not in this stack

| Concern | Where it lives |
| --- | --- |
| Worker build + deploy | `.github/workflows/deploy.yml` + Wrangler |
| Worker secrets | GitHub Actions secrets → `wrangler secret bulk` |
| R2 S3 access key pair | Cloudflare dashboard → R2 API tokens → GitHub `S3_*` |
| Google OAuth / Turnstile / Maps allowlists | Those product dashboards (`bottega.boston`) |
| Resend domain DNS (`bottega.boston`) | `scripts/setup-resend-domain.mjs` / Actions “Setup Resend domain DNS”; webhook URL in Resend dashboard |
