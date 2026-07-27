variable "environment" { type = string }
variable "product_id" {
  description = "Contabo VPS/VDS product ID."
  type        = string
}
variable "region" {
  type    = string
  default = "EU"
  validation {
    condition     = contains(["EU", "US-central", "US-east", "US-west", "SIN"], var.region)
    error_message = "Unsupported Contabo region."
  }
}
variable "contract_period" {
  description = "Initial Contabo contract period in months."
  type        = number
  default     = 1
  validation {
    condition     = contains([1, 3, 6, 12], var.contract_period)
    error_message = "Contract period must be 1, 3, 6, or 12 months."
  }
}
variable "image_id" {
  description = "Contabo operating-system image ID."
  type        = string
}
variable "ssh_key_ids" {
  description = "Contabo secret IDs containing authorized public SSH keys."
  type        = list(number)
  validation {
    condition     = length(var.ssh_key_ids) > 0
    error_message = "At least one Contabo SSH key secret ID is required."
  }
}
variable "replicas" {
  type = number
  validation {
    condition     = var.replicas >= 1 && floor(var.replicas) == var.replicas
    error_message = "Server replicas must be a positive integer."
  }
}
variable "cloud_init" {
  description = "Cloud-init configuration used to bootstrap each VPS."
  type        = string
  sensitive   = true
}
variable "public_tcp_ports" {
  type    = set(number)
  default = [80, 443]
}
variable "public_ipv4_cidrs" { type = set(string) }
variable "public_ipv6_cidrs" { type = set(string) }
variable "ssh_ipv4_cidrs" { type = set(string) }
variable "ssh_ipv6_cidrs" { type = set(string) }
