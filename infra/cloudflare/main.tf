data "cloudflare_zone" "site" {
  filter = {
    name = var.zone_name
  }
}

# 301 http → https for the whole zone (Edge Certificates → Always Use HTTPS).
resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = data.cloudflare_zone.site.id
  setting_id = "always_use_https"
  value      = "on"
}

resource "cloudflare_d1_database" "bottega" {
  account_id = var.cloudflare_account_id
  name       = var.d1_name
}

resource "cloudflare_r2_bucket" "media" {
  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
}

# Browser preflight (OPTIONS) for staff presigned PUTs from the site origin.
resource "cloudflare_r2_bucket_cors" "media" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.media.name

  rules = [
    {
      id = "staff-browser-uploads"
      allowed = {
        origins = [
          "https://${var.zone_name}",
          "http://localhost:3000",
          "http://127.0.0.1:3000",
        ]
        methods = ["PUT", "GET", "HEAD"]
        headers = ["Content-Type"]
      }
      expose_headers  = ["ETag"]
      max_age_seconds = 3600
    }
  ]
}

# Requires the Worker script to already exist (wrangler deploy first).
resource "cloudflare_workers_custom_domain" "apex" {
  count = var.manage_dns ? 1 : 0

  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zone.site.id
  zone_name  = var.zone_name
  hostname   = var.zone_name
  service    = var.worker_name
}
