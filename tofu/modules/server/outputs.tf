output "configuration" {
  value = {
    name            = "dugble-${var.environment}-server"
    network_cidr    = var.network_cidr
    instance_size   = var.instance_size
    replicas        = var.replicas
    container_image = var.container_image
  }
}
