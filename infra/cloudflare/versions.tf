terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.28"
    }
  }

}

# Auth via CLOUDFLARE_API_TOKEN in the environment (GitHub Actions secret).
provider "cloudflare" {}
