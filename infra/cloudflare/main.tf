data "cloudflare_zone" "site" {
  filter = {
    name = var.zone_name
  }
}

resource "cloudflare_d1_database" "bottega" {
  account_id = var.cloudflare_account_id
  name       = var.d1_name
}

resource "cloudflare_r2_bucket" "media" {
  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
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
