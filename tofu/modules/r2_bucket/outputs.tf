output "bucket_id" { value = cloudflare_r2_bucket.this.id }
output "bucket_name" { value = cloudflare_r2_bucket.this.name }
output "jurisdiction" { value = cloudflare_r2_bucket.this.jurisdiction }
output "s3_endpoint" {
  value = "https://${var.account_id}.r2.cloudflarestorage.com"
}
