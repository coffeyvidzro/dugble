output "configuration" {
  description = "Validated network settings for provider-specific resources."
  value = {
    name                 = "dugble-${var.environment}"
    cidr                 = var.network_cidr
    public_ingress_cidrs = var.public_ingress_cidrs
  }
}
