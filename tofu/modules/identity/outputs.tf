output "configuration" {
  value = {
    name            = "dugble-${var.environment}-identity"
    network_cidr    = var.network_cidr
    container_image = var.container_image
    cpu             = var.cpu
    memory_mb       = var.memory_mb
    gpu_enabled     = var.gpu_enabled
    public_access   = false
  }
}
