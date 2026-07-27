output "configuration" {
  description = "Validated Cloudflare R2 bucket settings for provider resources."
  value = {
    bucket_name    = "dugble-${var.environment}-private"
    location       = var.location
    retention_days = var.retention_days
    public_access  = false
  }
}
