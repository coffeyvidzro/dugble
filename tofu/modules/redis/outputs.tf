output "configuration" {
  value = {
    name              = "dugble-${var.environment}"
    network_cidr      = var.network_cidr
    instance_size     = var.instance_size
    high_availability = var.high_availability
  }
}
