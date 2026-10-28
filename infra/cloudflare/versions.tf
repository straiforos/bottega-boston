terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.28"
    }
  }

  # Local state by default. For a shared team, add a remote backend before the first apply.
}

# Auth via CLOUDFLARE_API_TOKEN in the environment (GitHub Actions secret).
provider "cloudflare" {}
