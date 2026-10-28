# State lives in R2 via the S3-compatible API. Bucket `bottega-tfstate` is
# created by the deploy workflow before `tofu init` if it does not exist.
#
# Credentials: R2 S3 tokens as AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
# Endpoint (passed at init): https://<ACCOUNT_ID>.r2.cloudflarestorage.com
# Path-style is required: virtual-hosted bucket hostnames fail TLS on R2.
terraform {
  backend "s3" {
    bucket = "bottega-tfstate"
    key    = "infra/cloudflare.tfstate"
    region = "auto"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
  }
}
