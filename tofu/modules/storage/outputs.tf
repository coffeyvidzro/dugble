output "configuration" {
  value = {
    name               = "dugble-${var.environment}-private"
    region             = var.region
    retention_days     = var.retention_days
    versioning_enabled = var.versioning_enabled
    public_access      = false
  }
}
