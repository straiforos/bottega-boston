# State lives in R2 (S3-compatible). Bucket `bottega-tfstate` is created by the
# deploy workflow before `tofu init` if it does not already exist.
#
# Credentials: same R2 S3 tokens as the app (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY),
# with endpoint from S3_ENDPOINT.
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
