variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account id that owns the Worker, D1, and R2 resources."
}

variable "zone_name" {
  type        = string
  description = "DNS zone already on Cloudflare (e.g. bottega.boston)."
  default     = "bottega.boston"
}

variable "worker_name" {
  type        = string
  description = "Wrangler Worker name; must match wrangler.jsonc name."
  default     = "bottega-boston"
}

variable "d1_name" {
  type        = string
  description = "D1 database name; must match wrangler.jsonc database_name."
  default     = "bottega"
}

variable "r2_bucket_name" {
  type        = string
  description = "R2 bucket name; must match wrangler.jsonc bucket_name."
  default     = "bottega-media"
}

variable "manage_dns" {
  type        = bool
  description = "When true, attach apex and www hostnames to the Worker as custom domains."
  default     = true
}
