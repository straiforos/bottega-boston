output "d1_database_id" {
  description = "UUID for wrangler.jsonc d1_databases[].database_id"
  value       = cloudflare_d1_database.bottega.id
}

output "d1_database_name" {
  value = cloudflare_d1_database.bottega.name
}

output "r2_bucket_name" {
  value = cloudflare_r2_bucket.media.name
}

output "zone_id" {
  value = data.cloudflare_zone.site.id
}

output "site_hostname" {
  value = var.zone_name
}
