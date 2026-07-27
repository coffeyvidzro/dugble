output "configuration" {
  value = {
    name                  = "dugble-${var.environment}"
    network_cidr          = var.network_cidr
    engine_version        = var.engine_version
    instance_size         = var.instance_size
    backup_retention_days = var.backup_retention_days
  }
}
