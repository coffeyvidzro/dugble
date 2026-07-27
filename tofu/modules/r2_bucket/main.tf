resource "cloudflare_r2_bucket" "this" {
  account_id    = var.account_id
  name          = var.bucket_name
  location      = lower(var.location)
  jurisdiction  = var.jurisdiction
  storage_class = var.storage_class
}

resource "cloudflare_r2_bucket_lifecycle" "this" {
  account_id   = var.account_id
  bucket_name  = cloudflare_r2_bucket.this.name
  jurisdiction = var.jurisdiction

  rules = [{
    id         = "expire-protected-uploads"
    enabled    = true
    conditions = { prefix = "" }
    delete_objects_transition = {
      condition = {
        max_age = var.retention_days * 86400
        type    = "Age"
      }
    }
    abort_multipart_uploads_transition = {
      condition = {
        max_age = 86400
        type    = "Age"
      }
    }
  }]
}
