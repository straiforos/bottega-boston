# Cloudflare infrastructure (OpenTofu)

Declares account resources the Worker binds to:

- D1 database `bottega`
- R2 bucket `bottega-media`
- Workers custom domain `bottega.boston` (after the script exists)

State is stored in R2 bucket `bottega-tfstate` (S3 backend). The deploy workflow creates that bucket if missing, then applies this stack on every push to `main`.

The Worker script, cron, secrets, and SQL migrations stay in Wrangler / GitHub Actions. CI renders `wrangler.ci.json` with the live D1 id from OpenTofu output so UUIDs never land in git.

## Prerequisites

1. Zone `bottega.boston` already on Cloudflare (nameservers delegated).
2. API token (`CLOUDFLARE_API_TOKEN`) with Account: D1 Edit, Workers R2 Storage Edit, Workers Scripts Edit; Zone: Workers Routes / DNS Edit for that zone.
3. R2 S3 API token in GitHub as `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT` (also used by the Worker for presigned uploads).
4. [OpenTofu](https://opentofu.org/) ≥ 1.6 locally if you apply by hand.

## Local apply

```bash
export CLOUDFLARE_API_TOKEN=…
export AWS_ACCESS_KEY_ID=…          # R2 S3 access key
export AWS_SECRET_ACCESS_KEY=…
export AWS_ENDPOINT_URL_S3=https://<accountid>.r2.cloudflarestorage.com

# Once: state bucket
bunx wrangler r2 bucket create bottega-tfstate

cp terraform.tfvars.example terraform.tfvars   # set cloudflare_account_id
tofu init -backend-config="endpoints={s3=\"$AWS_ENDPOINT_URL_S3\"}"
tofu apply -var='manage_dns=false'
# After wrangler deploy:
tofu apply -var='manage_dns=true'
```

## Not in this stack

| Concern | Where it lives |
| --- | --- |
| Worker build + deploy | `.github/workflows/deploy.yml` + Wrangler |
| Worker secrets | GitHub Actions secrets → `wrangler secret bulk` |
| R2 S3 access key pair | Cloudflare dashboard → R2 API tokens → GitHub `S3_*` |
| Google OAuth / Turnstile / Maps allowlists | Those product dashboards (`bottega.boston`) |
| Resend domain + webhook URL | Resend dashboard |
